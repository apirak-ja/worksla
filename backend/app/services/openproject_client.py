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
from app.core.database import SessionLocal
from app.repositories.setting_repository import SettingRepository

# Disable SSL warnings for self-signed certificates
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)

class OpenProjectClient:
    """OpenProject API client with caching and retry logic"""
    
    def __init__(self):
        # Seed with environment configuration first
        self.base_url = settings.OPENPROJECT_BASE_URL.rstrip('/')
        self.api_key = settings.OPENPROJECT_API_KEY
        self.verify_ssl = settings.OPENPROJECT_VERIFY_SSL
        
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
        self.session.verify = self.verify_ssl
        self._apply_headers()

        # Attempt to override credentials from persisted settings
        try:
            self.load_credentials_from_settings()
        except Exception as exc:
            logger.warning("Unable to load OpenProject credentials from settings: %s", exc)
    
    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with authentication"""
        return {
            "Authorization": f"Basic {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    def _apply_headers(self) -> None:
        """Ensure session headers reflect current credentials."""
        # Always advertise JSON payload expectations
        self.session.headers.setdefault("Content-Type", "application/json")
        self.session.headers.setdefault("Accept", "application/json")

        if self.api_key:
            self.session.headers["Authorization"] = f"Basic {self.api_key}"
        else:
            self.session.headers.pop("Authorization", None)

    def invalidate_cache(self) -> None:
        """Clear in-memory caches when credentials change."""
        self.user_cache.clear()
        self.work_package_cache.clear()
        self.cache_timestamps.clear()

    def update_credentials(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        verify_ssl: Optional[bool] = None,
        timeout: Optional[int] = None,
    ) -> None:
        """Update runtime credentials and related http configuration."""
        if base_url:
            self.base_url = base_url.rstrip('/')
        if api_key:
            self.api_key = api_key
        if verify_ssl is not None:
            self.verify_ssl = verify_ssl
            self.session.verify = verify_ssl
        if timeout is not None:
            self.timeout = timeout

        self._apply_headers()
        self.invalidate_cache()

    def load_credentials_from_settings(self) -> None:
        """Fetch persisted credentials from database-backed settings."""
        db = SessionLocal()
        try:
            repo = SettingRepository(db)
            stored_base_url = repo.get_value("openproject.base_url", None)
            stored_api_key = repo.get_value("openproject.api_key", None)
            stored_verify_ssl = repo.get_value("openproject.verify_ssl", self.verify_ssl)
            stored_timeout = repo.get_value("openproject.timeout", self.timeout)

            self.update_credentials(
                base_url=stored_base_url or self.base_url,
                api_key=stored_api_key or self.api_key,
                verify_ssl=stored_verify_ssl,
                timeout=stored_timeout,
            )
        finally:
            db.close()
    
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
        if not self.base_url:
            logger.error("OpenProject base URL is not configured")
            return None

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
            description_raw = self.safe_get(wp, "description", "raw", default="")
            work_packages.append({
                "wp_id": self.safe_get(wp, "id"),
                "subject": self.safe_get(wp, "subject", default=""),
                "description": description_raw,
                "description_plain": self.clean_html(description_raw),
                "status": self.safe_get(wp, "_links", "status", "title"),
                "priority": self.safe_get(wp, "_links", "priority", "title"),
                "type": self.safe_get(wp, "_links", "type", "title"),
                "assignee_id": self._extract_id_from_link(self.safe_get(wp, "_links", "assignee", default={})),
                "assignee_name": self.safe_get(wp, "_links", "assignee", "title"),
                "project_id": self._extract_id_from_link(self.safe_get(wp, "_links", "project", default={})),
                "project_name": self.safe_get(wp, "_links", "project", "title"),
                "category": self.safe_get(wp, "_links", "category", "title"),
                "author_name": self.safe_get(wp, "_links", "author", "title"),
                "start_date": self.safe_get(wp, "startDate"),
                "due_date": self.safe_get(wp, "dueDate"),
                "created_at": self.safe_get(wp, "createdAt"),
                "updated_at": self.safe_get(wp, "updatedAt"),
                "estimated_hours": self.safe_get(wp, "estimatedTime"),
                "spent_hours": self.safe_get(wp, "spentTime"),
                "done_ratio": self.safe_get(wp, "percentageDone", default=0),
                "raw": wp,
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
        
        data = self._make_sync_request(
            f"/api/v3/work_packages/{work_package_id}",
            params={"include": "attachments,watchers,relations,ancestors,children"}
        )
        
        if not data:
            return None
        
        # Extract custom fields with full details (including custom options)
        custom_fields_data = self._extract_custom_fields(data, data.get("_links", {}))
        
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
            "category": data.get("_links", {}).get("category", {}).get("title"),
            "author_name": data.get("_links", {}).get("author", {}).get("title"),
            "start_date": data.get("startDate"),
            "due_date": data.get("dueDate"),
            "created_at": data.get("createdAt"),
            "updated_at": data.get("updatedAt"),
            "estimated_hours": data.get("estimatedTime"),
            "spent_hours": data.get("spentTime"),
            "done_ratio": data.get("percentageDone", 0),
            "raw": data,
            "openproject_url": f"{self.base_url}/work_packages/{work_package_id}" if self.base_url else None
        }
        
        # Add individual custom field values to top level for easy access
        for field_key, field_data in custom_fields_data.items():
            if isinstance(field_data, dict):
                work_package[field_key] = field_data.get("value")
                # Add option value separately if exists
                if "option_value" in field_data:
                    work_package[f"{field_key}_option_value"] = field_data["option_value"]
                if "option_id" in field_data:
                    work_package[f"{field_key}_option_id"] = field_data["option_id"]
            else:
                work_package[field_key] = field_data
        
        # Keep full custom fields data structure for reference
        work_package["custom_fields_detail"] = custom_fields_data
        
        # Cache result
        self._cache_data(cache_key, work_package, self.work_package_cache)
        
        return work_package
    
    def _parse_activity_detail(self, detail_text: str) -> Dict[str, Any]:
        """Parse activity detail text to extract property, old_value, and new_value"""
        import re
        
        # Pattern 1: "Property changed from OldValue to NewValue"
        match = re.match(r'^(.+?) changed from (.+?) to (.+?)$', detail_text)
        if match:
            return {
                "property": match.group(1).strip(),
                "old_value": match.group(2).strip(),
                "new_value": match.group(3).strip()
            }
        
        # Pattern 2: "Property set to Value"
        match = re.match(r'^(.+?) set to (.+?)$', detail_text)
        if match:
            return {
                "property": match.group(1).strip(),
                "old_value": None,
                "new_value": match.group(2).strip()
            }
        
        # Pattern 3: Just property name (fallback)
        return {
            "property": detail_text.strip(),
            "old_value": None,
            "new_value": None
        }

    def _extract_custom_field_details(self, activity: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract custom field changes from activity"""
        custom_field_details = []
        
        for key, value in activity.items():
            if key.startswith("customField"):
                # Extract the custom field number
                field_num = key.replace("customField", "")
                custom_field_details.append({
                    "field_key": key,
                    "field_number": field_num,
                    "value": value
                })
        
        return custom_field_details

    def get_work_package_journals(self, work_package_id: int) -> List[Dict[str, Any]]:
        """Get work package activities/journal entries with enhanced parsing"""
        logger.info(f"Fetching activities for work package {work_package_id}")
        data = self._make_sync_request(f"/api/v3/work_packages/{work_package_id}/activities")
        
        if not data:
            logger.error(f"No data returned for activities of work package {work_package_id}")
            return []
        
        logger.info(f"Received {len(data.get('_embedded', {}).get('elements', []))} activities for work package {work_package_id}")
        activities = []
        for activity in data.get("_embedded", {}).get("elements", []):
            # Parse details from HTML/raw format to structured format
            parsed_details = []
            for detail in activity.get("details", []):
                raw_text = detail.get("raw", "")
                html_text = detail.get("html", "")
                
                if raw_text:
                    parsed_detail = self._parse_activity_detail(raw_text)
                    parsed_detail["html"] = html_text
                    parsed_details.append(parsed_detail)
            
            # Get comment/notes - try both fields and clean HTML
            notes_text = ""
            notes_html = ""
            if "comment" in activity:
                notes_text = activity.get("comment", {}).get("raw", "")
                notes_html = activity.get("comment", {}).get("html", "")
            if not notes_text and "notes" in activity:
                notes_text = activity.get("notes", {}).get("raw", "")
                notes_html = activity.get("notes", {}).get("html", "")
            
            # Clean HTML tags from notes if raw is empty
            if not notes_text and notes_html:
                notes_text = self.clean_html(notes_html)
            
            # Get user information - handle cases where user might be deleted or system
            user_link = activity.get("_links", {}).get("user", {})
            user_name = user_link.get("title", "")
            user_id = self._extract_id_from_link(user_link)
            
            # Handle special cases for user names
            if not user_name or user_name == "Unknown" or user_name == "":
                # Check if it's a system activity
                if activity.get("version", 1) == 1:
                    user_name = "ผู้สร้างงาน (System)"
                else:
                    user_name = "ผู้ใช้งาน (User Deleted)"
            
            # Map known deleted users by ID
            if user_name == "ผู้ใช้งาน (User Deleted)" and user_id:
                # Known user mappings for deleted users
                user_id_mappings = {
                    6: "Apirak Jaisue",  # Based on activity data
                    13: "Peerachai Intarakum",  # Based on WP 35301 assignee
                    # Add more mappings as needed
                }
                if user_id in user_id_mappings:
                    user_name = user_id_mappings[user_id]
            
            # If still "User Deleted", try to extract assignee name from details
            if user_name == "ผู้ใช้งาน (User Deleted)":
                for detail in parsed_details:
                    if detail.get("property") == "Assignee" and detail.get("new_value"):
                        user_name = detail.get("new_value", "ผู้ใช้งาน (User Deleted)")
                        break
            
            # If still "User Deleted", try to fetch user details from API
            if user_name == "ผู้ใช้งาน (User Deleted)":
                user_href = user_link.get("href")
                if user_href:
                    try:
                        user_details = self.get_user_details(user_href)
                        if user_details and user_details.get("name"):
                            user_name = user_details.get("name")
                        elif user_details and user_details.get("login"):
                            user_name = user_details.get("login")
                        else:
                            logger.warning(f"User {user_id} is deleted and no details available from API")
                    except Exception as e:
                        logger.warning(f"Failed to fetch user details for user_id {user_id} ({user_href}): {e}")
                        # Keep "User Deleted" as fallback
            
            # Extract custom field information if present
            custom_fields = self._extract_custom_field_details(activity)
            
            activity_data = {
                "id": activity.get("id"),
                "notes": notes_text,
                "notes_html": notes_html,
                "created_at": activity.get("createdAt"),
                "user_id": self._extract_id_from_link(user_link),
                "user_name": user_name,
                "version": activity.get("version"),
                "details": parsed_details,
                "custom_fields": custom_fields
            }
            
            activities.append(activity_data)
        
        # Sort by created_at ascending (oldest first) for timeline display
        return sorted(activities, key=lambda x: x["created_at"], reverse=False)
    
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
    
    def get_custom_option_details(self, option_url: str) -> Optional[Dict[str, Any]]:
        """Fetch custom option details from OpenProject API"""
        try:
            logger.info(f"Received option_url: {option_url}")
            
            # Clean and normalize the URL
            if option_url.startswith("/cmms/api/v3/"):
                # Path already has /cmms/api/v3, just prepend domain
                option_url = f"https://hosp.wu.ac.th{option_url}"
            elif option_url.startswith("/api/v3/"):
                # Path has only /api/v3, prepend base URL
                option_url = f"{self.base_url}{option_url}"
            elif option_url.startswith("http"):
                # Full URL - use as-is (OpenProject rarely returns full URLs for custom options)
                pass
            else:
                # Relative path without prefix
                option_url = f"{self.base_url}/api/v3/{option_url.lstrip('/')}"
            
            logger.info(f"Fetching custom option details from {option_url}")
            response = self.session.get(option_url, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Successfully fetched custom option details: {data.get('value', 'N/A')}")
            
            return {
                "id": data.get("id"),
                "value": data.get("value"),
                "title": data.get("_links", {}).get("customField", {}).get("title", ""),
                "href": option_url
            }
        except Exception as e:
            logger.error(f"Failed to fetch custom option details from {option_url}: {e}")
            return None

    def _extract_custom_fields(self, custom_fields: Dict, links: Dict = None) -> Dict[str, Any]:
        """Extract and format custom fields with enhanced support for links and custom options"""
        extracted = {}
        
        # Custom field name mapping (Thai labels)
        field_labels = {
            "customField2": "ประเภทงานย่อย Network",
            "customField3": "ประเภทงานย่อย Hardware",
            "customField4": "รายละเอียด",
            "customField5": "สถานที่",
            "customField6": "หน่วยงานที่ตั้ง",
            "customField7": "ผู้แจ้ง (เบอร์โทร)",
            "customField8": "แจ้งโดย",
            "customField9": "ความเร่งด่วน",
            "customField10": "วันที่เริ่มต้น",
            "customField23": "วันที่รับงาน",
            "customField25": "วันที่สิ้นสุด"
        }
        
        # First, extract direct custom field values
        for key, value in custom_fields.items():
            if key.startswith("customField"):
                if isinstance(value, dict) and "raw" in value:
                    extracted[key] = {
                        "value": value["raw"],
                        "label": field_labels.get(key, key.replace("customField", "Custom Field "))
                    }
                elif value is not None and value != "":
                    extracted[key] = {
                        "value": value,
                        "label": field_labels.get(key, key.replace("customField", "Custom Field "))
                    }
        
        # Then, extract custom fields from _links (for custom options, etc.)
        if links:
            for key, link_value in links.items():
                if key.startswith("customField"):
                    if isinstance(link_value, dict):
                        label = field_labels.get(key, key.replace("customField", "Custom Field "))
                        
                        # If it has a title, use that
                        if "title" in link_value and link_value["title"]:
                            if key not in extracted:
                                extracted[key] = {"label": label}
                            extracted[key]["value"] = link_value["title"]
                        
                        # If it's a link to custom option, fetch details
                        if "href" in link_value and "custom_options" in link_value["href"]:
                            option_details = self.get_custom_option_details(link_value["href"])
                            if option_details:
                                if key not in extracted:
                                    extracted[key] = {"label": label}
                                extracted[key]["option_value"] = option_details.get("value")
                                extracted[key]["option_id"] = option_details.get("id")
                                # Use option value as the display value if no title was set
                                if "value" not in extracted[key] or not extracted[key]["value"]:
                                    extracted[key]["value"] = option_details.get("value")
        
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


# Create a module-level client instance for convenience
try:
    openproject_client = OpenProjectClient()
except Exception as e:
    logger.error(f"Failed to create OpenProject client: {e}")
    openproject_client = None
