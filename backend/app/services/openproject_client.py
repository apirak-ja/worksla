"""
OpenProject API Client Service
Handles communication with OpenProject instance for work packages, users, and activities
"""
import os
import requests
import urllib3
import json
import logging
import re
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timedelta
from urllib.parse import urlencode
from app.core.config import settings

# Disable SSL warnings for self-signed certificates
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)

class OpenProjectClient:
    """OpenProject API client with caching and retry logic"""
    
    def __init__(self):
        self.base_url = settings.OPENPROJECT_BASE_URL.rstrip('/')
        self.api_key = settings.OPENPROJECT_API_KEY
        
        if not self.api_key:
            logger.warning("OPENPROJECT_API_KEY not set - some features may not work")
        
        # Cache settings
        self.cache_timeout = 120  # 2 minutes
        self.user_cache = {}
        self.work_package_cache = {}
        self.cache_timestamps = {}
        
        # Request settings
        self.timeout = 30
        self.max_retries = 3
        
        # Session for sync requests
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Basic {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        })
        self.session.verify = False
    
    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with authentication"""
        return {
            "Authorization": f"Basic {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid"""
        if cache_key not in self.cache_timestamps:
            return False
        
        cache_time = self.cache_timestamps[cache_key]
        return datetime.now() - cache_time < timedelta(seconds=self.cache_timeout)
    
    def _cache_data(self, cache_key: str, data: Any, cache_dict: Dict):
        """Cache data with timestamp"""
        cache_dict[cache_key] = data
        self.cache_timestamps[cache_key] = datetime.now()
    
    def _make_sync_request(self, url: str, params: Optional[Dict] = None) -> Optional[Dict[str, Any]]:
        """Make synchronous HTTP request with retry logic"""
        full_url = f"{self.base_url}{url}"
        
        for attempt in range(self.max_retries):
            try:
                response = self.session.get(full_url, params=params, timeout=self.timeout)
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 404:
                    logger.warning(f"Resource not found: {full_url}")
                    return None
                else:
                    logger.error(f"HTTP {response.status_code} for {full_url}")
                    
            except Exception as e:
                logger.error(f"Request attempt {attempt + 1} failed for {full_url}: {e}")
                if attempt == self.max_retries - 1:
                    return None
        
        return None
    
    
    def list_work_packages(
        self,
        offset: int = 0,
        limit: int = 20,
        filters: Optional[Dict[str, Any]] = None,
        sort_by: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        List work packages with pagination and filtering
        Returns: (work_packages, total_count)
        """
        cache_key = f"wp_list_{offset}_{limit}_{json.dumps(filters, sort_keys=True)}_{sort_by}"
        
        if self._is_cache_valid(cache_key) and cache_key in self.work_package_cache:
            return self.work_package_cache[cache_key]
        
        params = {
            "offset": offset,
            "pageSize": limit
        }
        
        # Add filters
        if filters:
            filter_conditions = []
            for key, value in filters.items():
                if key == "status" and value:
                    filter_conditions.append(f'{{"status":{{"operator":"=","values":["{value}"]}}}}')
                elif key == "assignee" and value:
                    filter_conditions.append(f'{{"assignee":{{"operator":"=","values":["{value}"]}}}}')
                elif key == "project" and value:
                    filter_conditions.append(f'{{"project":{{"operator":"=","values":["{value}"]}}}}')
                elif key == "type" and value:
                    filter_conditions.append(f'{{"type":{{"operator":"=","values":["{value}"]}}}}')
            
            if filter_conditions:
                params["filters"] = f'[{",".join(filter_conditions)}]'
        
        # Add sorting
        if sort_by:
            params["sortBy"] = f'[["id","{sort_by}"]]'
        
        data = self._make_sync_request("/api/v3/work_packages", params)
        
        if not data:
            return [], 0
        
        work_packages = []
        for wp in data.get("_embedded", {}).get("elements", []):
            work_packages.append({
                "wp_id": wp.get("id"),
                "subject": wp.get("subject"),
                "description": wp.get("description", {}).get("raw", ""),
                "status": wp.get("_links", {}).get("status", {}).get("title"),
                "priority": wp.get("_links", {}).get("priority", {}).get("title"),
                "type": wp.get("_links", {}).get("type", {}).get("title"),
                "assignee_id": self._extract_id_from_link(wp.get("_links", {}).get("assignee")),
                "assignee_name": wp.get("_links", {}).get("assignee", {}).get("title"),
                "project_id": self._extract_id_from_link(wp.get("_links", {}).get("project")),
                "project_name": wp.get("_links", {}).get("project", {}).get("title"),
                "start_date": wp.get("startDate"),
                "due_date": wp.get("dueDate"),
                "created_at": wp.get("createdAt"),
                "updated_at": wp.get("updatedAt"),
                "estimated_hours": wp.get("estimatedTime"),
                "spent_hours": wp.get("spentTime"),
                "done_ratio": wp.get("percentageDone", 0)
            })
        
        total_count = data.get("total", 0)
        result = (work_packages, total_count)
        
        # Cache result
        self._cache_data(cache_key, result, self.work_package_cache)
        
        return result
    
    def get_work_package(self, work_package_id: int) -> Optional[Dict[str, Any]]:
        """Get detailed work package information"""
        cache_key = f"wp_detail_{work_package_id}"
        
        if self._is_cache_valid(cache_key) and cache_key in self.work_package_cache:
            return self.work_package_cache[cache_key]
        
        data = self._make_sync_request(f"/api/v3/work_packages/{work_package_id}")
        
        if not data:
            return None
        
        work_package = {
            "wp_id": data.get("id"),
            "subject": data.get("subject"),
            "description": data.get("description", {}).get("html", ""),
            "status": data.get("_links", {}).get("status", {}).get("title"),
            "priority": data.get("_links", {}).get("priority", {}).get("title"),
            "type": data.get("_links", {}).get("type", {}).get("title"),
            "assignee_id": self._extract_id_from_link(data.get("_links", {}).get("assignee")),
            "assignee_name": data.get("_links", {}).get("assignee", {}).get("title"),
            "project_id": self._extract_id_from_link(data.get("_links", {}).get("project")),
            "project_name": data.get("_links", {}).get("project", {}).get("title"),
            "start_date": data.get("startDate"),
            "due_date": data.get("dueDate"),
            "created_at": data.get("createdAt"),
            "updated_at": data.get("updatedAt"),
            "estimated_hours": data.get("estimatedTime"),
            "spent_hours": data.get("spentTime"),
            "done_ratio": data.get("percentageDone", 0),
            "custom_fields": self._extract_custom_fields(data.get("customField", {}))
        }
        
        # Cache result
        self._cache_data(cache_key, work_package, self.work_package_cache)
        
        return work_package
    
    def get_work_package_activities(self, work_package_id: int) -> List[Dict[str, Any]]:
        """Get work package activities/journal entries"""
        data = self._make_sync_request(f"/api/v3/work_packages/{work_package_id}/activities")
        
        if not data:
            return []
        
        activities = []
        for activity in data.get("_embedded", {}).get("elements", []):
            activities.append({
                "id": activity.get("id"),
                "notes": activity.get("notes", {}).get("html", ""),
                "created_at": activity.get("createdAt"),
                "user_id": self._extract_id_from_link(activity.get("_links", {}).get("user")),
                "user_name": activity.get("_links", {}).get("user", {}).get("title"),
                "version": activity.get("version"),
                "details": activity.get("details", [])
            })
        
        return sorted(activities, key=lambda x: x["created_at"], reverse=True)
    
    def list_assignees(self) -> List[Dict[str, Any]]:
        """
        Get list of assignees from work packages (since /api/v3/users requires admin access)
        """
        try:
            # Get work packages to extract assignees from
            work_packages, _ = self.list_work_packages(offset=0, limit=1000)  # Get many WPs to find all assignees
            
            # Extract unique assignees
            assignee_map = {}
            
            for wp in work_packages:
                assignee_id = wp.get('assignee_id')
                assignee_name = wp.get('assignee_name')
                
                if assignee_id and assignee_name and assignee_name != 'Unknown':
                    if assignee_id not in assignee_map:
                        assignee_map[assignee_id] = {
                            'id': assignee_id,
                            'name': assignee_name,
                            'email': None,  # We don't have email from WP data
                            'firstName': None,
                            'lastName': None,
                            'status': 'active'  # Assume active if assigned to WP
                        }
            
            assignees = list(assignee_map.values())
            
            # Sort by name
            assignees.sort(key=lambda x: x['name'])
            
            logger.info(f"Retrieved {len(assignees)} assignees from work packages")
            return assignees
            
        except Exception as e:
            logger.error(f"Error fetching assignees from work packages: {e}")
            return []
    
    def get_sla_metrics(self, 
                       start_date: Optional[str] = None, 
                       end_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculate SLA metrics from work packages"""
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Get work packages for the period
        filters = {
            "created_at": f">={start_date}",
            "created_at": f"<={end_date}"
        }
        
        work_packages, total = self.list_work_packages(
            offset=0, 
            limit=1000,  # Get more for metrics
            filters=filters
        )
        
        # Calculate metrics
        total_count = len(work_packages)
        completed_count = len([wp for wp in work_packages if wp.get("done_ratio") == 100])
        overdue_count = 0
        due_soon_count = 0
        
        now = datetime.now()
        for wp in work_packages:
            if wp.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(wp["due_date"].replace("Z", "+00:00"))
                    if due_date < now and wp.get("done_ratio", 0) < 100:
                        overdue_count += 1
                    elif due_date < now + timedelta(days=7) and wp.get("done_ratio", 0) < 100:
                        due_soon_count += 1
                except (ValueError, TypeError):
                    continue
        
        return {
            "total_work_packages": total_count,
            "completed": completed_count,
            "overdue": overdue_count,
            "due_soon": due_soon_count,
            "completion_rate": (completed_count / total_count * 100) if total_count > 0 else 0,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    
    def _extract_id_from_link(self, link_obj: Optional[Dict]) -> Optional[int]:
        """Extract ID from OpenProject API link object"""
        if not link_obj or not link_obj.get("href"):
            return None
        
        href = link_obj["href"]
        # Extract ID from URL like "/api/v3/users/123"
        try:
            return int(href.split("/")[-1])
        except (ValueError, IndexError):
            return None
    
    def _extract_custom_fields(self, custom_fields: Dict) -> Dict[str, Any]:
        """Extract and format custom fields"""
        extracted = {}
        for key, value in custom_fields.items():
            if isinstance(value, dict) and "raw" in value:
                extracted[key] = value["raw"]
            else:
                extracted[key] = value
        return extracted
    
    @staticmethod
    def safe_get(data: Any, *keys: str, default: Any = None) -> Any:
        """
        Safely get nested dictionary values
        """
        try:
            for key in keys:
                if isinstance(data, dict) and key in data:
                    data = data[key]
                else:
                    return default
            return data if data is not None and data != "" else default
        except (KeyError, TypeError, AttributeError):
            return default
    
    @staticmethod
    def clean_html(text: str) -> str:
        """
        Remove HTML tags and convert entities
        """
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', text)
        
        # Convert HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        text = text.replace('&amp;', '&')
        text = text.replace('&quot;', '"')
        text = text.replace('&#39;', "'")
        
        # Remove excess whitespace
        text = ' '.join(text.split())
        return text.strip()
    
    @staticmethod
    def format_date(date_str: Optional[str]) -> Optional[datetime]:
        """
        Parse ISO date string to datetime
        """
        if not date_str:
            return None
        
        try:
            if date_str.endswith('Z'):
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                dt = datetime.fromisoformat(date_str)
            return dt
        except Exception as e:
            logger.warning(f"Error parsing date {date_str}: {e}")
            return None
    
    def list_assignees(self) -> List[Dict[str, Any]]:
        """
        Get list of assignees from work packages (since /api/v3/users requires admin access)
        """
        try:
            # Get work packages to extract assignees from
            work_packages, _ = self.list_work_packages(offset=0, limit=1000)  # Get many WPs to find all assignees
            
            # Extract unique assignees
            assignee_map = {}
            
            for wp in work_packages:
                assignee_id = wp.get('assignee_id')
                assignee_name = wp.get('assignee_name')
                
                if assignee_id and assignee_name and assignee_name != 'Unknown':
                    if assignee_id not in assignee_map:
                        assignee_map[assignee_id] = {
                            'id': assignee_id,
                            'name': assignee_name,
                            'email': None,  # We don't have email from WP data
                            'firstName': None,
                            'lastName': None,
                            'status': 'active'  # Assume active if assigned to WP
                        }
            
            assignees = list(assignee_map.values())
            
            # Sort by name
            assignees.sort(key=lambda x: x['name'])
            
            logger.info(f"Retrieved {len(assignees)} assignees from work packages")
            return assignees
            
        except Exception as e:
            logger.error(f"Error fetching assignees from work packages: {e}")
            return []
    
    def get_sla_metrics(self, 
                       start_date: Optional[str] = None, 
                       end_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculate SLA metrics from work packages"""
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Get work packages for the period
        filters = {
            "created_at": f">={start_date}",
            "created_at": f"<={end_date}"
        }
        
        work_packages, total = self.list_work_packages(
            offset=0, 
            limit=1000,  # Get more for metrics
            filters=filters
        )
        
        # Calculate metrics
        total_count = len(work_packages)
        completed_count = len([wp for wp in work_packages if wp.get("done_ratio") == 100])
        overdue_count = 0
        due_soon_count = 0
        
        now = datetime.now()
        for wp in work_packages:
            if wp.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(wp["due_date"].replace("Z", "+00:00"))
                    if due_date < now and wp.get("done_ratio", 0) < 100:
                        overdue_count += 1
                    elif due_date < now + timedelta(days=7) and wp.get("done_ratio", 0) < 100:
                        due_soon_count += 1
                except (ValueError, TypeError):
                    continue
        
        return {
            "total_work_packages": total_count,
            "completed": completed_count,
            "overdue": overdue_count,
            "due_soon": due_soon_count,
            "completion_rate": (completed_count / total_count * 100) if total_count > 0 else 0,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    
    def _extract_id_from_link(self, link_obj: Optional[Dict]) -> Optional[int]:
        """Extract ID from OpenProject API link object"""
        if not link_obj or not link_obj.get("href"):
            return None
        
        href = link_obj["href"]
        # Extract ID from URL like "/api/v3/users/123"
        try:
            return int(href.split("/")[-1])
        except (ValueError, IndexError):
            return None
    
    def _extract_custom_fields(self, custom_fields: Dict) -> Dict[str, Any]:
        """Extract and format custom fields"""
        extracted = {}
        for key, value in custom_fields.items():
            if isinstance(value, dict) and "raw" in value:
                extracted[key] = value["raw"]
            else:
                extracted[key] = value
        return extracted
    
    @staticmethod
    def safe_get(data: Any, *keys: str, default: Any = None) -> Any:
        """
        Safely get nested dictionary values
        """
        try:
            for key in keys:
                if isinstance(data, dict) and key in data:
                    data = data[key]
                else:
                    return default
            return data if data is not None and data != "" else default
        except (KeyError, TypeError, AttributeError):
            return default
    
    @staticmethod
    def clean_html(text: str) -> str:
        """
        Remove HTML tags and convert entities
        """
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', text)
        
        # Convert HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        text = text.replace('&amp;', '&')
        text = text.replace('&quot;', '"')
        text = text.replace('&#39;', "'")
        
        # Remove excess whitespace
        text = ' '.join(text.split())
        return text.strip()
    
    @staticmethod
    def format_date(date_str: Optional[str]) -> Optional[datetime]:
        """
        Parse ISO date string to datetime
        """
        if not date_str:
            return None
        
        try:
            if date_str.endswith('Z'):
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                dt = datetime.fromisoformat(date_str)
            return dt
        except Exception as e:
            logger.warning(f"Error parsing date {date_str}: {e}")
            return None
    
    def list_assignees(self) -> List[Dict[str, Any]]:
        """
        Get list of assignees from work packages (since /api/v3/users requires admin access)
        """
        try:
            # Get work packages to extract assignees from
            work_packages, _ = self.list_work_packages(offset=0, limit=1000)  # Get many WPs to find all assignees
            
            # Extract unique assignees
            assignee_map = {}
            
            for wp in work_packages:
                assignee_id = wp.get('assignee_id')
                assignee_name = wp.get('assignee_name')
                
                if assignee_id and assignee_name and assignee_name != 'Unknown':
                    if assignee_id not in assignee_map:
                        assignee_map[assignee_id] = {
                            'id': assignee_id,
                            'name': assignee_name,
                            'email': None,  # We don't have email from WP data
                            'firstName': None,
                            'lastName': None,
                            'status': 'active'  # Assume active if assigned to WP
                        }
            
            assignees = list(assignee_map.values())
            
            # Sort by name
            assignees.sort(key=lambda x: x['name'])
            
            logger.info(f"Retrieved {len(assignees)} assignees from work packages")
            return assignees
            
        except Exception as e:
            logger.error(f"Error fetching assignees from work packages: {e}")
            return []
    
    def get_sla_metrics(self, 
                       start_date: Optional[str] = None, 
                       end_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculate SLA metrics from work packages"""
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Get work packages for the period
        filters = {
            "created_at": f">={start_date}",
            "created_at": f"<={end_date}"
        }
        
        work_packages, total = self.list_work_packages(
            offset=0, 
            limit=1000,  # Get more for metrics
            filters=filters
        )
        
        # Calculate metrics
        total_count = len(work_packages)
        completed_count = len([wp for wp in work_packages if wp.get("done_ratio") == 100])
        overdue_count = 0
        due_soon_count = 0
        
        now = datetime.now()
        for wp in work_packages:
            if wp.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(wp["due_date"].replace("Z", "+00:00"))
                    if due_date < now and wp.get("done_ratio", 0) < 100:
                        overdue_count += 1
                    elif due_date < now + timedelta(days=7) and wp.get("done_ratio", 0) < 100:
                        due_soon_count += 1
                except (ValueError, TypeError):
                    continue
        
        return {
            "total_work_packages": total_count,
            "completed": completed_count,
            "overdue": overdue_count,
            "due_soon": due_soon_count,
            "completion_rate": (completed_count / total_count * 100) if total_count > 0 else 0,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    
    def _extract_id_from_link(self, link_obj: Optional[Dict]) -> Optional[int]:
        """Extract ID from OpenProject API link object"""
        if not link_obj or not link_obj.get("href"):
            return None
        
        href = link_obj["href"]
        # Extract ID from URL like "/api/v3/users/123"
        try:
            return int(href.split("/")[-1])
        except (ValueError, IndexError):
            return None
    
    def _extract_custom_fields(self, custom_fields: Dict) -> Dict[str, Any]:
        """Extract and format custom fields"""
        extracted = {}
        for key, value in custom_fields.items():
            if isinstance(value, dict) and "raw" in value:
                extracted[key] = value["raw"]
            else:
                extracted[key] = value
        return extracted
    
    @staticmethod
    def safe_get(data: Any, *keys: str, default: Any = None) -> Any:
        """
        Safely get nested dictionary values
        """
        try:
            for key in keys:
                if isinstance(data, dict) and key in data:
                    data = data[key]
                else:
                    return default
            return data if data is not None and data != "" else default
        except (KeyError, TypeError, AttributeError):
            return default
    
    @staticmethod
    def clean_html(text: str) -> str:
        """
        Remove HTML tags and convert entities
        """
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', text)
        
        # Convert HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        text = text.replace('&amp;', '&')
        text = text.replace('&quot;', '"')
        text = text.replace('&#39;', "'")
        
        # Remove excess whitespace
        text = ' '.join(text.split())
        return text.strip()
    
    @staticmethod
    def format_date(date_str: Optional[str]) -> Optional[datetime]:
        """
        Parse ISO date string to datetime
        """
        if not date_str:
            return None
        
        try:
            if date_str.endswith('Z'):
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                dt = datetime.fromisoformat(date_str)
            return dt
        except Exception as e:
            logger.warning(f"Error parsing date {date_str}: {e}")
            return None
    
    def list_assignees(self) -> List[Dict[str, Any]]:
        """
        Get list of assignees from work packages (since /api/v3/users requires admin access)
        """
        try:
            # Get work packages to extract assignees from
            work_packages, _ = self.list_work_packages(offset=0, limit=1000)  # Get many WPs to find all assignees
            
            # Extract unique assignees
            assignee_map = {}
            
            for wp in work_packages:
                assignee_id = wp.get('assignee_id')
                assignee_name = wp.get('assignee_name')
                
                if assignee_id and assignee_name and assignee_name != 'Unknown':
                    if assignee_id not in assignee_map:
                        assignee_map[assignee_id] = {
                            'id': assignee_id,
                            'name': assignee_name,
                            'email': None,  # We don't have email from WP data
                            'firstName': None,
                            'lastName': None,
                            'status': 'active'  # Assume active if assigned to WP
                        }
            
            assignees = list(assignee_map.values())
            
            # Sort by name
            assignees.sort(key=lambda x: x['name'])
            
            logger.info(f"Retrieved {len(assignees)} assignees from work packages")
            return assignees
            
        except Exception as e:
            logger.error(f"Error fetching assignees from work packages: {e}")
            return []
    
    def get_sla_metrics(self, 
                       start_date: Optional[str] = None, 
                       end_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculate SLA metrics from work packages"""
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Get work packages for the period
        filters = {
            "created_at": f">={start_date}",
            "created_at": f"<={end_date}"
        }
        
        work_packages, total = self.list_work_packages(
            offset=0, 
            limit=1000,  # Get more for metrics
            filters=filters
        )
        
        # Calculate metrics
        total_count = len(work_packages)
        completed_count = len([wp for wp in work_packages if wp.get("done_ratio") == 100])
        overdue_count = 0
        due_soon_count = 0
        
        now = datetime.now()
        for wp in work_packages:
            if wp.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(wp["due_date"].replace("Z", "+00:00"))
                    if due_date < now and wp.get("done_ratio", 0) < 100:
                        overdue_count += 1
                    elif due_date < now + timedelta(days=7) and wp.get("done_ratio", 0) < 100:
                        due_soon_count += 1
                except (ValueError, TypeError):
                    continue
        
        return {
            "total_work_packages": total_count,
            "completed": completed_count,
            "overdue": overdue_count,
            "due_soon": due_soon_count,
            "completion_rate": (completed_count / total_count * 100) if total_count > 0 else 0,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    
    def _extract_id_from_link(self, link_obj: Optional[Dict]) -> Optional[int]:
        """Extract ID from OpenProject API link object"""
        if not link_obj or not link_obj.get("href"):
            return None
        
        href = link_obj["href"]
        # Extract ID from URL like "/api/v3/users/123"
        try:
            return int(href.split("/")[-1])
        except (ValueError, IndexError):
            return None
    
    def _extract_custom_fields(self, custom_fields: Dict) -> Dict[str, Any]:
        """Extract and format custom fields"""
        extracted = {}
        for key, value in custom_fields.items():
            if isinstance(value, dict) and "raw" in value:
                extracted[key] = value["raw"]
            else:
                extracted[key] = value
        return extracted
    
    @staticmethod
    def safe_get(data: Any, *keys: str, default: Any = None) -> Any:
        """
        Safely get nested dictionary values
        """
        try:
            for key in keys:
                if isinstance(data, dict) and key in data:
                    data = data[key]
                else:
                    return default
            return data if data is not None and data != "" else default
        except (KeyError, TypeError, AttributeError):
            return default
    
    @staticmethod
    def clean_html(text: str) -> str:
        """
        Remove HTML tags and convert entities
        """
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', text)
        
        # Convert HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        text = text.replace('&amp;', '&')
        text = text.replace('&quot;', '"')
        text = text.replace('&#39;', "'")
        
        # Remove excess whitespace
        text = ' '.join(text.split())
        return text.strip()
    
    @staticmethod
    def format_date(date_str: Optional[str]) -> Optional[datetime]:
        """
        Parse ISO date string to datetime
        """
        if not date_str:
            return None
        
        try:
            if date_str.endswith('Z'):
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                dt = datetime.fromisoformat(date_str)
            return dt
        except Exception as e:
            logger.warning(f"Error parsing date {date_str}: {e}")
            return None
    
    def list_assignees(self) -> List[Dict[str, Any]]:
        """
        Get list of assignees from work packages (since /api/v3/users requires admin access)
        """
        try:
            # Get work packages to extract assignees from
            work_packages, _ = self.list_work_packages(offset=0, limit=1000)  # Get many WPs to find all assignees
            
            # Extract unique assignees
            assignee_map = {}
            
            for wp in work_packages:
                assignee_id = wp.get('assignee_id')
                assignee_name = wp.get('assignee_name')
                
                if assignee_id and assignee_name and assignee_name != 'Unknown':
                    if assignee_id not in assignee_map:
                        assignee_map[assignee_id] = {
                            'id': assignee_id,
                            'name': assignee_name,
                            'email': None,  # We don't have email from WP data
                            'firstName': None,
                            'lastName': None,
                            'status': 'active'  # Assume active if assigned to WP
                        }
            
            assignees = list(assignee_map.values())
            
            # Sort by name
            assignees.sort(key=lambda x: x['name'])
            
            logger.info(f"Retrieved {len(assignees)} assignees from work packages")
            return assignees
            
        except Exception as e:
            logger.error(f"Error fetching assignees from work packages: {e}")
            return []
    
    def get_sla_metrics(self, 
                       start_date: Optional[str] = None, 
                       end_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculate SLA metrics from work packages"""
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Get work packages for the period
        filters = {
            "created_at": f">={start_date}",
            "created_at": f"<={end_date}"
        }
        
        work_packages, total = self.list_work_packages(
            offset=0, 
            limit=1000,  # Get more for metrics
            filters=filters
        )
        
        # Calculate metrics
        total_count = len(work_packages)
        completed_count = len([wp for wp in work_packages if wp.get("done_ratio") == 100])
        overdue_count = 0
        due_soon_count = 0
        
        now = datetime.now()
        for wp in work_packages:
            if wp.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(wp["due_date"].replace("Z", "+00:00"))
                    if due_date < now and wp.get("done_ratio", 0) < 100:
                        overdue_count += 1
                    elif due_date < now + timedelta(days=7) and wp.get("done_ratio", 0) < 100:
                        due_soon_count += 1
                except (ValueError, TypeError):
                    continue
        
        return {
            "total_work_packages": total_count,
            "completed": completed_count,
            "overdue": overdue_count,
            "due_soon": due_soon_count,
            "completion_rate": (completed_count / total_count * 100) if total_count > 0 else 0,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    
    def _extract_id_from_link(self, link_obj: Optional[Dict]) -> Optional[int]:
        """Extract ID from OpenProject API link object"""
        if not link_obj or not link_obj.get("href"):
            return None
        
        href = link_obj["href"]
        # Extract ID from URL like "/api/v3/users/123"
        try:
            return int(href.split("/")[-1])
        except (ValueError, IndexError):
            return None
    
    def _extract_custom_fields(self, custom_fields: Dict) -> Dict[str, Any]:
        """Extract and format custom fields"""
        extracted = {}
        for key, value in custom_fields.items():
            if isinstance(value, dict) and "raw" in value:
                extracted[key] = value["raw"]
            else:
                extracted[key] = value
        return extracted
    
    @staticmethod
    def safe_get(data: Any, *keys: str, default: Any = None) -> Any:
        """
        Safely get nested dictionary values
        """
        try:
            for key in keys:
                if isinstance(data, dict) and key in data:
                    data = data[key]
                else:
                    return default
            return data if data is not None and data != "" else default
        except (KeyError, TypeError, AttributeError):
            return default
    
    @staticmethod
    def clean_html(text: str) -> str:
        """
        Remove HTML tags and convert entities
        """
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', text)
        
        # Convert HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        text = text.replace('&amp;', '&')
        text = text.replace('&quot;', '"')
        text = text.replace('&#39;', "'")
        
        # Remove excess whitespace
        text = ' '.join(text.split())
        return text.strip()
    
    @staticmethod
    def format_date(date_str: Optional[str]) -> Optional[datetime]:
        """
        Parse ISO date string to datetime
        """
        if not date_str:
            return None
        
        try:
            if date_str.endswith('Z'):
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                dt = datetime.fromisoformat(date_str)
            return dt
        except Exception as e:
            logger.warning(f"Error parsing date {date_str}: {e}")
            return None
    
    def list_assignees(self) -> List[Dict[str, Any]]:
        """
        Get list of assignees from work packages (since /api/v3/users requires admin access)
        """
        try:
            # Get work packages to extract assignees from
            work_packages, _ = self.list_work_packages(offset=0, limit=1000)  # Get many WPs to find all assignees
            
            # Extract unique assignees
            assignee_map = {}
            
            for wp in work_packages:
                assignee_id = wp.get('assignee_id')
                assignee_name = wp.get('assignee_name')
                
                if assignee_id and assignee_name and assignee_name != 'Unknown':
                    if assignee_id not in assignee_map:
                        assignee_map[assignee_id] = {
                            'id': assignee_id,
                            'name': assignee_name,
                            'email': None,  # We don't have email from WP data
                            'firstName': None,
                            'lastName': None,
                            'status': 'active'  # Assume active if assigned to WP
                        }
            
            assignees = list(assignee_map.values())
            
            # Sort by name
            assignees.sort(key=lambda x: x['name'])
            
            logger.info(f"Retrieved {len(assignees)} assignees from work packages")
            return assignees
            
        except Exception as e:
            logger.error(f"Error fetching assignees from work packages: {e}")
            return []
    
    def get_sla_metrics(self, 
                       start_date: Optional[str] = None, 
                       end_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculate SLA metrics from work packages"""
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Get work packages for the period
        filters = {
            "created_at": f">={start_date}",
            "created_at": f"<={end_date}"
        }
        
        work_packages, total = self.list_work_packages(
            offset=0, 
            limit=1000,  # Get more for metrics
            filters=filters
        )
        
        # Calculate metrics
        total_count = len(work_packages)
        completed_count = len([wp for wp in work_packages if wp.get("done_ratio") == 100])
        overdue_count = 0
        due_soon_count = 0
        
        now = datetime.now()
        for wp in work_packages:
            if wp.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(wp["due_date"].replace("Z", "+00:00"))
                    if due_date < now and wp.get("done_ratio", 0) < 100:
                        overdue_count += 1
                    elif due_date < now + timedelta(days=7) and wp.get("done_ratio", 0) < 100:
                        due_soon_count += 1
                except (ValueError, TypeError):
                    continue
        
        return {
            "total_work_packages": total_count,
            "completed": completed_count,
            "overdue": overdue_count,
            "due_soon": due_soon_count,
            "completion_rate": (completed_count / total_count * 100) if total_count > 0 else 0,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    
    def _extract_id_from_link(self, link_obj: Optional[Dict]) -> Optional[int]:
        """Extract ID from OpenProject API link object"""
        if not link_obj or not link_obj.get("href"):
            return None
        
        href = link_obj["href"]
        # Extract ID from URL like "/api/v3/users/123"
        try:
            return int(href.split("/")[-1])
        except (ValueError, IndexError):
            return None
    
    def _extract_custom_fields(self, custom_fields: Dict) -> Dict[str, Any]:
        """Extract and format custom fields"""
        extracted = {}
        for key, value in custom_fields.items():
            if isinstance(value, dict) and "raw" in value:
                extracted[key] = value["raw"]
            else:
                extracted[key] = value
        return extracted
    
    @staticmethod
    def safe_get(data: Any, *keys: str, default: Any = None) -> Any:
        """
        Safely get nested dictionary values
        """
        try:
            for key in keys:
                if isinstance(data, dict) and key in data:
                    data = data[key]
                else:
                    return default
            return data if data is not None and data != "" else default
        except (KeyError, TypeError, AttributeError):
            return default
    
    @staticmethod
    def clean_html(text: str) -> str:
        """
        Remove HTML tags and convert entities
        """
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', text)
        
        # Convert HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        text = text.replace('&amp;', '&')
        text = text.replace('&quot;', '"')
        text = text.replace('&#39;', "'")
        
        # Remove excess whitespace
        text = ' '.join(text.split())
        return text.strip()
    
    @staticmethod
    def format_date(date_str: Optional[str]) -> Optional[datetime]:
        """
        Parse ISO date string to datetime
        """
        if not date_str:
            return None
        
        try:
            if date_str.endswith('Z'):
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                dt = datetime.fromisoformat(date_str)
            return dt
        except Exception as e:
            logger.warning(f"Error parsing date {date_str}: {e}")
            return None
    
    def list_assignees(self) -> List[Dict[str, Any]]:
        """
        Get list of assignees from work packages (since /api/v3/users requires admin access)
        """
        try:
            # Get work packages to extract assignees from
            work_packages, _ = self.list_work_packages(offset=0, limit=1000)  # Get many WPs to find all assignees
            
            # Extract unique assignees
            assignee_map = {}
            
            for wp in work_packages:
                assignee_id = wp.get('assignee_id')
                assignee_name = wp.get('assignee_name')
                
                if assignee_id and assignee_name and assignee_name != 'Unknown':
                    if assignee_id not in assignee_map:
                        assignee_map[assignee_id] = {
                            'id': assignee_id,
                            'name': assignee_name,
                            'email': None,  # We don't have email from WP data
                            'firstName': None,
                            'lastName': None,
                            'status': 'active'  # Assume active if assigned to WP
                        }
            
            assignees = list(assignee_map.values())
            
            # Sort by name
            assignees.sort(key=lambda x: x['name'])
            
            logger.info(f"Retrieved {len(assignees)} assignees from work packages")
            return assignees
            
        except Exception as e:
            logger.error(f"Error fetching assignees from work packages: {e}")
            return []
    
    def get_sla_metrics(self, 
                       start_date: Optional[str] = None, 
                       end_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculate SLA metrics from work packages"""
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Get work packages for the period
        filters = {
            "created_at": f">={start_date}",
            "created_at": f"<={end_date}"
        }
        
        work_packages, total = self.list_work_packages(
            offset=0, 
            limit=1000,  # Get more for metrics
            filters=filters
        )
        
        # Calculate metrics
        total_count = len(work_packages)
        completed_count = len([wp for wp in work_packages if wp.get("done_ratio") == 100])
        overdue_count = 0
        due_soon_count = 0
        
        now = datetime.now()
        for wp in work_packages:
            if wp.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(wp["due_date"].replace("Z", "+00:00"))
                    if due_date < now and wp.get("done_ratio", 0) < 100:
                        overdue_count += 1
                    elif due_date < now + timedelta(days=7) and wp.get("done_ratio", 0) < 100:
                        due_soon_count += 1
                except (ValueError, TypeError):
                    continue
        
        return {
            "total_work_packages": total_count,
            "completed": completed_count,
            "overdue": overdue_count,
            "due_soon": due_soon_count,
            "completion_rate": (completed_count / total_count * 100) if total_count > 0 else 0,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    
    def _extract_id_from_link(self, link_obj: Optional[Dict]) -> Optional[int]:
        """Extract ID from OpenProject API link object"""
        if not link_obj or not link_obj.get("href"):
            return None
        
        href = link_obj["href"]
        # Extract ID from URL like "/api/v3/users/123"
        try:
            return int(href.split("/")[-1])
        except (ValueError, IndexError):
            return None
    
    def _extract_custom_fields(self, custom_fields: Dict) -> Dict[str, Any]:
        """Extract and format custom fields"""
        extracted = {}
        for key, value in custom_fields.items():
            if isinstance(value, dict) and "raw" in value:
                extracted[key] = value["raw"]
            else:
                extracted[key] = value
        return extracted
    
    @staticmethod
    def safe_get(data: Any, *keys: str, default: Any = None) -> Any:
        """
        Safely get nested dictionary values
        """
        try:
            for key in keys:
                if isinstance(data, dict) and key in data:
                    data = data[key]
                else:
                    return default
            return data if data is not None and data != "" else default
        except (KeyError, TypeError, AttributeError):
            return default
    
    @staticmethod
    def clean_html(text: str) -> str:
        """
        Remove HTML tags and convert entities
        """
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', text)
        
        # Convert HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        text = text.replace('&amp;', '&')
        text = text.replace('&quot;', '"')
        text = text.replace('&#39;', "'")
        
        # Remove excess whitespace
        text = ' '.join(text.split())
        return text.strip()
    
    @staticmethod
    def format_date(date_str: Optional[str]) -> Optional[datetime]:
        """
        Parse ISO date string to datetime
        """
        if not date_str:
            return None
        
        try:
            if date_str.endswith('Z'):
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                dt = datetime.fromisoformat(date_str)
            return dt
        except Exception as e:
            logger.warning(f"Error parsing date {date_str}: {e}")
            return None
    
    def list_assignees(self) -> List[Dict[str, Any]]:
        """
        Get list of assignees from work packages (since /api/v3/users requires admin access)
        """
        try:
            # Get work packages to extract assignees from
            work_packages, _ = self.list_work_packages(offset=0, limit=1000)  # Get many WPs to find all assignees
            
            # Extract unique assignees
            assignee_map = {}
            
            for wp in work_packages:
                assignee_id = wp.get('assignee_id')
                assignee_name = wp.get('assignee_name')
                
                if assignee_id and assignee_name and assignee_name != 'Unknown':
                    if assignee_id not in assignee_map:
                        assignee_map[assignee_id] = {
                            'id': assignee_id,
                            'name': assignee_name,
                            'email': None,  # We don't have email from WP data
                            'firstName': None,
                            'lastName': None,
                            'status': 'active'  # Assume active if assigned to WP
                        }
            
            assignees = list(assignee_map.values())
            
            # Sort by name
            assignees.sort(key=lambda x: x['name'])
            
            logger.info(f"Retrieved {len(assignees)} assignees from work packages")
            return assignees
            
        except Exception as e:
            logger.error(f"Error fetching assignees from work packages: {e}")
            return []
    
    def get_sla_metrics(self, 
                       start_date: Optional[str] = None, 
                       end_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculate SLA metrics from work packages"""
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Get work packages for the period
        filters = {
            "created_at": f">={start_date}",
            "created_at": f"<={end_date}"
        }
        
        work_packages, total = self.list_work_packages(
            offset=0, 
            limit=1000,  # Get more for metrics
            filters=filters
        )
        
        # Calculate metrics
        total_count = len(work_packages)
        completed_count = len([wp for wp in work_packages if wp.get("done_ratio") == 100])
        overdue_count = 0
        due_soon_count = 0
        
        now = datetime.now()
        for wp in work_packages:
            if wp.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(wp["due_date"].replace("Z", "+00:00"))
                    if due_date < now and wp.get("done_ratio", 0) < 100:
                        overdue_count += 1
                    elif due_date < now + timedelta(days=7) and wp.get("done_ratio", 0) < 100:
                        due_soon_count += 1
                except (ValueError, TypeError):
                    continue
        
        return {
            "total_work_packages": total_count,
            "completed": completed_count,
            "overdue": overdue_count,
            "due_soon": due_soon_count,
            "completion_rate": (completed_count / total_count * 100) if total_count > 0 else 0,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    
    def _extract_id_from_link(self, link_obj: Optional[Dict]) -> Optional[int]:
        """Extract ID from OpenProject API link object"""
        if not link_obj or not link_obj.get("href"):
            return None
        
        href = link_obj["href"]
        # Extract ID from URL like "/api/v3/users/123"
        try:
            return int(href.split("/")[-1])
        except (ValueError, IndexError):
            return None
    
    def _extract_custom_fields(self, custom_fields: Dict) -> Dict[str, Any]:
        """Extract and format custom fields"""
        extracted = {}
        for key, value in custom_fields.items():
            if isinstance(value, dict) and "raw" in value:
                extracted[key] = value["raw"]
            else:
                extracted[key] = value
        return extracted
    
    @staticmethod
    def safe_get(data: Any, *keys: str, default: Any = None) -> Any:
        """
        Safely get nested dictionary values
        """
        try:
            for key in keys:
                if isinstance(data, dict) and key in data:
                    data = data[key]
                else:
                    return default
            return data if data is not None and data != "" else default
        except (KeyError, TypeError, AttributeError):
            return default
    
    @staticmethod
    def clean_html(text: str) -> str:
        """
        Remove HTML tags and convert entities
        """
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', text)
        
        # Convert HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        text = text.replace('&amp;', '&')
        text = text.replace('&quot;', '"')
        text = text.replace('&#39;', "'")
        
        # Remove excess whitespace
        text = ' '.join(text.split())
        return text.strip()
    
    @staticmethod
    def format_date(date_str: Optional[str]) -> Optional[datetime]:
        """
        Parse ISO date string to datetime
        """
        if not date_str:
            return None
        
        try:
            if date_str.endswith('Z'):
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                dt = datetime.fromisoformat(date_str)
            return dt
        except Exception as e:
            logger.warning(f"Error parsing date {date_str}: {e}")
            return None
    
    def list_assignees(self) -> List[Dict[str, Any]]:
        """
        Get list of assignees from work packages (since /api/v3/users requires admin access)
        """
        try:
            # Get work packages to extract assignees from
            work_packages, _ = self.list_work_packages(offset=0, limit=1000)  # Get many WPs to find all assignees
            
            # Extract unique assignees
            assignee_map = {}
            
            for wp in work_packages:
                assignee_id = wp.get('assignee_id')
                assignee_name = wp.get('assignee_name')
                
                if assignee_id and assignee_name and assignee_name != 'Unknown':
                    if assignee_id not in assignee_map:
                        assignee_map[assignee_id] = {
                            'id': assignee_id,
                            'name': assignee_name,
                            'email': None,  # We don't have email from WP data
                            'firstName': None,
                            'lastName': None,
                            'status': 'active'  # Assume active if assigned to WP
                        }
            
            assignees = list(assignee_map.values())
            
            # Sort by name
            assignees.sort(key=lambda x: x['name'])
            
            logger.info(f"Retrieved {len(assignees)} assignees from work packages")
            return assignees
            
        except Exception as e:
            logger.error(f"Error fetching assignees from work packages: {e}")
            return []
    
    def get_sla_metrics(self, 
                       start_date: Optional[str] = None, 
                       end_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculate SLA metrics from work packages"""
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Get work packages for the period
        filters = {
            "created_at": f">={start_date}",
            "created_at": f"<={end_date}"
        }
        
        work_packages, total = self.list_work_packages(
            offset=0, 
            limit=1000,  # Get more for metrics
            filters=filters
        )
        
        # Calculate metrics
        total_count = len(work_packages)
        completed_count = len([wp for wp in work_packages if wp.get("done_ratio") == 100])
        overdue_count = 0
        due_soon_count = 0
        
        now = datetime.now()
        for wp in work_packages:
            if wp.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(wp["due_date"].replace("Z", "+00:00"))
                    if due_date < now and wp.get("done_ratio", 0) < 100:
                        overdue_count += 1
                    elif due_date < now + timedelta(days=7) and wp.get("done_ratio", 0) < 100:
                        due_soon_count += 1
                except (ValueError, TypeError):
                    continue
        
        return {
            "total_work_packages": total_count,
            "completed": completed_count,
            "overdue": overdue_count,
            "due_soon": due_soon_count,
            "completion_rate": (completed_count / total_count * 100) if total_count > 0 else 0,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    
    def _extract_id_from_link(self, link_obj: Optional[Dict]) -> Optional[int]:
        """Extract ID from OpenProject API link object"""
        if not link_obj or not link_obj.get("href"):
            return None
        
        href = link_obj["href"]
        # Extract ID from URL like "/api/v3/users/123"
        try:
            return int(href.split("/")[-1])
        except (ValueError, IndexError):
            return None
    
    def _extract_custom_fields(self, custom_fields: Dict) -> Dict[str, Any]:
        """Extract and format custom fields"""
        extracted = {}
        for key, value in custom_fields.items():
            if isinstance(value, dict) and "raw" in value:
                extracted[key] = value["raw"]
            else:
                extracted[key] = value
        return extracted
    
    @staticmethod
    def safe_get(data: Any, *keys: str, default: Any = None) -> Any:
        """
        Safely get nested dictionary values
        """
        try:
            for key in keys:
                if isinstance(data, dict) and key in data:
                    data = data[key]
                else:
                    return default
            return data if data is not None and data != "" else default
        except (KeyError, TypeError, AttributeError):
            return default
    
    @staticmethod
    def clean_html(text: str) -> str:
        """
        Remove HTML tags and convert entities
        """
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', text)
        
        # Convert HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        text = text.replace('&amp;', '&')
        text = text.replace('&quot;', '"')
        text = text.replace('&#39;', "'")
        
        # Remove excess whitespace
        text = ' '.join(text.split())
        return text.strip()
    
    @staticmethod
    def format_date(date_str: Optional[str]) -> Optional[datetime]:
        """
        Parse ISO date string to datetime
        """
        if not date_str:
            return None
        
        try:
            if date_str.endswith('Z'):
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                dt = datetime.fromisoformat(date_str)
            return dt
        except Exception as e:
            logger.warning(f"Error parsing date {date_str}: {e}")
            return None
    
    def list_assignees(self) -> List[Dict[str, Any]]:
        """
        Get list of assignees from work packages (since /api/v3/users requires admin access)
        """
        try:
            # Get work packages to extract assignees from
            work_packages, _ = self.list_work_packages(offset=0, limit=1000)  # Get many WPs to find all assignees
            
            # Extract unique assignees
            assignee_map = {}
            
            for wp in work_packages:
                assignee_id = wp.get('assignee_id')
                assignee_name = wp.get('assignee_name')
                
                if assignee_id and assignee_name and assignee_name != 'Unknown':
                    if assignee_id not in assignee_map:
                        assignee_map[assignee_id] = {
                            'id': assignee_id,
                            'name': assignee_name,
                            'email': None,  # We don't have email from WP data
                            'firstName': None,
                            'lastName': None,
                            'status': 'active'  # Assume active if assigned to WP
                        }
            
            assignees = list(assignee_map.values())
            
            # Sort by name
            assignees.sort(key=lambda x: x['name'])
            
            logger.info(f"Retrieved {len(assignees)} assignees from work packages")
            return assignees
            
        except Exception as e:
            logger.error(f"Error fetching assignees from work packages: {e}")
            return []
    
    def get_sla_metrics(self, 
                       start_date: Optional[str] = None, 
                       end_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculate SLA metrics from work packages"""
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Get work packages for the period
        filters = {
            "created_at": f">={start_date}",
            "created_at": f"<={end_date}"
        }
        
        work_packages, total = self.list_work_packages(
            offset=0, 
            limit=1000,  # Get more for metrics
            filters=filters
        )
        
        # Calculate metrics
        total_count = len(work_packages)
        completed_count = len([wp for wp in work_packages if wp.get("done_ratio") == 100])
        overdue_count = 0
        due_soon_count = 0
        
        now = datetime.now()
        for wp in work_packages:
            if wp.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(wp["due_date"].replace("Z", "+00:00"))
                    if due_date < now and wp.get("done_ratio", 0) < 100:
                        overdue_count += 1
                    elif due_date < now + timedelta(days=7) and wp.get("done_ratio", 0) < 100:
                        due_soon_count += 1
                except (ValueError, TypeError):
                    continue
        
        return {
            "total_work_packages": total_count,
            "completed": completed_count,
            "overdue": overdue_count,
            "due_soon": due_soon_count,
            "completion_rate": (completed_count / total_count * 100) if total_count > 0 else 0,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    
    def _extract_id_from_link(self, link_obj: Optional[Dict]) -> Optional[int]:
        """Extract ID from OpenProject API link object"""
        if not link_obj or not link_obj.get("href"):
            return None
        
        href = link_obj["href"]
        # Extract ID from URL like "/api/v3/users/123"
        try:
            return int(href.split("/")[-1])
        except (ValueError, IndexError):
            return None
    
    def _extract_custom_fields(self, custom_fields: Dict) -> Dict[str, Any]:
        """Extract and format custom fields"""
        extracted = {}
        for key, value in custom_fields.items():
            if isinstance(value, dict) and "raw" in value:
                extracted[key] = value["raw"]
            else:
                extracted[key] = value
        return extracted
    
    @staticmethod
    def safe_get(data: Any, *keys: str, default: Any = None) -> Any:
        """
        Safely get nested dictionary values
        """
        try:
            for key in keys:
                if isinstance(data, dict) and key in data:
                    data = data[key]
                else:
                    return default
            return data if data is not None and data != "" else default
        except (KeyError, TypeError, AttributeError):
            return default
    
    @staticmethod
    def clean_html(text: str) -> str:
        """
        Remove HTML tags and convert entities
        """
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', text)
        
        # Convert HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        text = text.replace('&amp;', '&')
        text = text.replace('&quot;', '"')
        text = text.replace('&#39;', "'")
        
        # Remove excess whitespace
        text = ' '.join(text.split())
        return text.strip()
    
    @staticmethod
    def format_date(date_str: Optional[str]) -> Optional[datetime]:
        """
        Parse ISO date string to datetime
        """
        if not date_str:
            return None
        
        try:
            if date_str.endswith('Z'):
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                dt = datetime.fromisoformat(date_str)
            return dt
        except Exception as e:
            logger.warning(f"Error parsing date {date_str}: {e}")
            return None
    
    def list_assignees(self) -> List[Dict[str, Any]]:
        """
        Get list of assignees from work packages (since /api/v3/users requires admin access)
        """
        try:
            # Get work packages to extract assignees from
            work_packages, _ = self.list_work_packages(offset=0, limit=1000)  # Get many WPs to find all assignees
            
            # Extract unique assignees
            assignee_map = {}
            
            for wp in work_packages:
                assignee_id = wp.get('assignee_id')
                assignee_name = wp.get('assignee_name')
                
                if assignee_id and assignee_name and assignee_name != 'Unknown':
                    if assignee_id not in assignee_map:
                        assignee_map[assignee_id] = {
                            'id': assignee_id,
                            'name': assignee_name,
                            'email': None,  # We don't have email from WP data
                            'firstName': None,
                            'lastName': None,
                            'status': 'active'  # Assume active if assigned to WP
                        }
            
            assignees = list(assignee_map.values())
            
            # Sort by name
            assignees.sort(key=lambda x: x['name'])
            
            logger.info(f"Retrieved {len(assignees)} assignees from work packages")
            return assignees
            
        except Exception as e:
            logger.error(f"Error fetching assignees from work packages: {e}")
            return []
    
    def get_sla_metrics(self, 
                       start_date: Optional[str] = None, 
                       end_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculate SLA metrics from work packages"""
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Get work packages for the period
        filters = {
            "created_at": f">={start_date}",
            "created_at": f"<={end_date}"
        }
        
        work_packages, total = self.list_work_packages(
            offset=0, 
            limit=1000,  # Get more for metrics
            filters=filters
        )
        
        # Calculate metrics
        total_count = len(work_packages)
        completed_count = len([wp for wp in work_packages if wp.get("done_ratio") == 100])
        overdue_count = 0
        due_soon_count = 0
        
        now = datetime.now()
        for wp in work_packages:
            if wp.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(wp["due_date"].replace("Z", "+00:00"))
                    if due_date < now and wp.get("done_ratio", 0) < 100:
                        overdue_count += 1
                    elif due_date < now + timedelta(days=7) and wp.get("done_ratio", 0) < 100:
                        due_soon_count += 1
                except (ValueError, TypeError):
                    continue
        
        return {
            "total_work_packages": total_count,
            "completed": completed_count,
            "overdue": overdue_count,
            "due_soon": due_soon_count,
            "completion_rate": (completed_count / total_count * 100) if total_count > 0 else 0,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    
    def _extract_id_from_link(self, link_obj: Optional[Dict]) -> Optional[int]:
        """Extract ID from OpenProject API link object"""
        if not link_obj or not link_obj.get("href"):
            return None
        
        href = link_obj["href"]
        # Extract ID from URL like "/api/v3/users/123"
        try:
            return int(href.split("/")[-1])
        except (ValueError, IndexError):
            return None
    
    def _extract_custom_fields(self, custom_fields: Dict) -> Dict[str, Any]:
        """Extract and format custom fields"""
        extracted = {}
        for key, value in custom_fields.items():
            if isinstance(value, dict) and "raw" in value:
                extracted[key] = value["raw"]
            else:
                extracted[key] = value
        return extracted
    
    @staticmethod
    def safe_get(data: Any, *keys: str, default: Any = None) -> Any:
        """
        Safely get nested dictionary values
        """
        try:
            for key in keys:
                if isinstance(data, dict) and key in data:
                    data = data[key]
                else:
                    return default
            return data if data is not None and data != "" else default
        except (KeyError, TypeError, AttributeError):
            return default
    
    @staticmethod
    def clean_html(text: str) -> str:
        """
        Remove HTML tags and convert entities
        """
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', text)
        
        # Convert HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        text = text.replace('&amp;', '&')
        text = text.replace('&quot;', '"')
        text = text.replace('&#39;', "'")
        
        # Remove excess whitespace
        text = ' '.join(text.split())
        return text.strip()
    
    @staticmethod
    def format_date(date_str: Optional[str]) -> Optional[datetime]:
        """
        Parse ISO date string to datetime
        """
        if not date_str:
            return None
        
        try:
            if date_str.endswith('Z'):
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                dt = datetime.fromisoformat(date_str)
            return dt
        except Exception as e:
                       logger.warning(f"Error parsing date {date_str}: {e}")
            return None
    
    def list_assignees(self) -> List[Dict[str, Any]]:
        """
        Get list of assignees from work packages (since /api/v3/users requires admin access)
        """
        try:
            # Get work packages to extract assignees from
            work_packages, _ = self.list_work_packages(offset=0, limit=1000)  # Get many WPs to find all assignees
            
            # Extract unique assignees
            assignee_map = {}
            
            for wp in work_packages:
                assignee_id = wp.get('assignee_id')
                assignee_name = wp.get('assignee_name')
                
                if assignee_id and assignee_name and assignee_name != 'Unknown':
                    if assignee_id not in assignee_map:
                        assignee_map[assignee_id] = {
                            'id': assignee_id,
                            'name': assignee_name,
                            'email': None,  # We don't have email from WP data
                            'firstName': None,
                            'lastName': None,
                            'status': 'active'  # Assume active if assigned to WP
                        }
            
            assignees = list(assignee_map.values())
            
            # Sort by name
            assignees.sort(key=lambda x: x['name'])
            
            logger.info(f"Retrieved {len(assignees)} assignees from work packages")
            return assignees
            
        except Exception as e:
            logger.error(f"Error fetching assignees from work packages: {e}")
            return []
    
    def get_sla_metrics(self, 
                       start_date: Optional[str] = None, 
                       end_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculate SLA metrics from work packages"""
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Get work packages for the period
        filters = {
            "created_at": f">={start_date}",
            "created_at": f"<={end_date}"
        }
        
        work_packages, total = self.list_work_packages(
            offset=0, 
            limit=1000,  # Get more for metrics
            filters=filters
        )
        
        # Calculate metrics
        total_count = len(work_packages)
        completed_count = len([wp for wp in work_packages if wp.get("done_ratio") == 100])
        overdue_count = 0
        due_soon_count = 0
        
        now = datetime.now()
        for wp in work_packages:
            if wp.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(wp["due_date"].replace("Z", "+00:00"))
                    if due_date < now and wp.get("done_ratio", 0) < 100:
                        overdue_count += 1
                    elif due_date < now + timedelta(days=7) and wp.get("done_ratio", 0) < 100:
                        due_soon_count += 1
                except (ValueError, TypeError):
                    continue
        
        return {
            "total_work_packages": total_count,
            "completed": completed_count,
            "overdue": overdue_count,
            "due_soon": due_soon_count,
            "completion_rate": (completed_count / total_count * 100) if total_count > 0 else 0,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    
    def _extract_id_from_link(self, link_obj: Optional[Dict]) -> Optional[int]:
        """Extract ID from OpenProject API link object"""
        if not link_obj or not link_obj.get("href"):
            return None
        
        href = link_obj["href"]
        # Extract ID from URL like "/api/v3/users/123"
        try:
            return int(href.split("/")[-1])
        except (ValueError, IndexError):
            return None
    
    def _extract_custom_fields(self, custom_fields: Dict) -> Dict[str, Any]:
        """Extract and format custom fields"""
        extracted = {}
        for key, value in custom_fields.items():
            if isinstance(value, dict) and "raw" in value:
                extracted[key] = value["raw"]
            else:
                extracted[key] = value
        return extracted
    
    @staticmethod
    def safe_get(data: Any, *keys: str, default: Any = None) -> Any:
        """
        Safely get nested dictionary values
        """
        try:
            for key in keys:
                if isinstance(data, dict) and key in data:
                    data = data[key]
                else:
                    return default
            return data if data is not None and data != "" else default
        except (KeyError, TypeError, AttributeError):
            return default
    
    @staticmethod
    def clean_html(text: str) -> str:
        """
        Remove HTML tags and convert entities
        """
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', text)
        
        # Convert HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        text = text.replace('&amp;', '&')
        text = text.replace('&quot;', '"')
        text = text.replace('&#39;', "'")
        
        # Remove excess whitespace
        text = ' '.join(text.split())
        return text.strip()
    
    @staticmethod
    def format_date(date_str: Optional[str]) -> Optional[datetime]:
        """
        Parse ISO date string to datetime
        """
        if not date_str:
            return None
        
        try:
            if date_str.endswith('Z'):
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                dt = datetime.fromisoformat(date_str)
            return dt
        except Exception as e:
            logger.warning(f"Error parsing date {date_str}: {e}")
            return None
