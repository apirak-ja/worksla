import os
import requests
import urllib3
import json
import logging
import re
from typing import Optional, Dict, Any, List
from datetime import datetime
from dotenv import load_dotenv  # เพิ่ม import สำหรับโหลด .env file

# ANSI Color Codes สำหรับ terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'

# ตั้งค่า logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ปิดคำเตือน SSL แต่ยังคง verify=False ตามความต้องการ
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
logger.warning("SSL verification is disabled. This is insecure and should only be used in development environments.")

class OpenProjectClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Basic {self.api_key}",
            "Content-Type": "application/json"
        })
        # ยังคง verify=False ตามความต้องการ แต่เพิ่มคำเตือน
        self.session.verify = False
        logger.warning("Using insecure SSL verification (verify=False) for OpenProject API requests.")
        
        # Cache สำหรับ user names เพื่อเพิ่ม performance
        self.user_cache = {}

    def get_work_package(self, work_package_id: int) -> Optional[Dict[str, Any]]:
        if not isinstance(work_package_id, int) or work_package_id <= 0:
            logger.error(f"Invalid work_package_id: {work_package_id}")
            return None

        url = f"{self.base_url}/work_packages/{work_package_id}"
        try:
            logger.info(f"Fetching work package {work_package_id} from {url}")
            response = self.session.get(url)
            response.raise_for_status()
            logger.info(f"Successfully fetched work package {work_package_id}")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch work package {work_package_id}: {e}")
            return None

    def get_activities(self, work_package_id: int) -> Optional[List[Dict[str, Any]]]:
        url = f"{self.base_url}/work_packages/{work_package_id}/activities"
        try:
            logger.info(f"Fetching activities for work package {work_package_id}")
            response = self.session.get(url)
            response.raise_for_status()
            data = response.json()
            activities = data.get("_embedded", {}).get("elements", [])
            logger.info(f"Successfully fetched {len(activities)} activities")
            return activities
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch activities for work_package {work_package_id}: {e}")
            return None

    def get_user_details(self, user_url: str) -> Optional[Dict[str, Any]]:
        if user_url.startswith("/cmms/api/v3"):
            user_url = f"https://hosp.wu.ac.th{user_url}"
        
        try:
            logger.info(f"Fetching user details from {user_url}")
            response = self.session.get(user_url)
            response.raise_for_status()
            logger.info("Successfully fetched user details")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch user details from {user_url}: {e}")
            return None

    def get_user_name(self, user_link: Dict[str, Any]) -> str:
        """ดึงชื่อผู้ใช้จาก user link ด้วย caching"""
        if not user_link or not isinstance(user_link, dict):
            return "Unknown"
        
        # ถ้ามี title ใน link อยู่แล้ว
        if 'title' in user_link:
            return user_link['title']
        
        # ถ้ามี href ให้ fetch ข้อมูลเพิ่มเติม (ใช้ cache)
        if 'href' in user_link:
            user_url = user_link['href']
            if user_url in self.user_cache:
                return self.user_cache[user_url]
            
            user_details = self.get_user_details(user_url)
            if user_details and 'name' in user_details:
                user_name = user_details['name']
                self.user_cache[user_url] = user_name
                return user_name
        
        return "Unknown"

    def get_custom_option_details(self, option_url: str) -> Optional[Dict[str, Any]]:
        if option_url.startswith("/cmms/api/v3"):
            option_url = f"https://hosp.wu.ac.th{option_url}"

        try:
            logger.info(f"Fetching custom option details from {option_url}")
            response = self.session.get(option_url)
            response.raise_for_status()
            logger.info("Successfully fetched custom option details")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch custom option details from {option_url}: {e}")
            return None

def safe_get(data, *keys, default="N/A"):
    """ฟังก์ชันสำหรับเข้าถึงข้อมูลแบบปลอดภัย"""
    try:
        for key in keys:
            if isinstance(data, dict) and key in data:
                data = data[key]
            else:
                return default
        return data if data is not None and data != "" else default
    except (KeyError, TypeError, AttributeError):
        return default

def format_date(date_str: str) -> str:
    """แปลงวันที่เป็นรูปแบบ MM/DD/YYYY HH:MM AM/PM โดยใช้ local timezone"""
    if not date_str or date_str == "N/A":
        return "N/A"
    try:
        # แปลง ISO format เป็น datetime (assume UTC)
        if date_str.endswith('Z'):
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        else:
            dt = datetime.fromisoformat(date_str)
        
        # แปลงเป็น local time (Thailand +7)
        from datetime import timezone, timedelta
        thailand_tz = timezone(timedelta(hours=7))
        dt_local = dt.astimezone(thailand_tz)
        
        # แปลงเป็นรูปแบบที่ต้องการ
        return dt_local.strftime("%m/%d/%Y %I:%M %p")
    except Exception as e:
        logger.warning(f"Error formatting date {date_str}: {e}")
        return date_str

def clean_html(text: str) -> str:
    """ลบ HTML tags และแปลง HTML entities"""
    if not text:
        return ""

    # ลบ HTML tags
    text = re.sub('<[^<]+?>', '', text)

    # แปลง HTML entities
    text = text.replace('&nbsp;', ' ')
    text = text.replace('&lt;', '<')
    text = text.replace('&gt;', '>')
    text = text.replace('&amp;', '&')
    text = text.replace('&quot;', '"')
    text = text.replace('&#39;', "'")

    # ลบช่องว่างเกิน
    text = ' '.join(text.split())
    return text.strip()

def print_section_header(title: str, color: str = Colors.BLUE):
    """พิมพ์หัวข้อส่วนด้วยสี"""
    print(f"\n{color}{'='*60}{Colors.END}")
    print(f"{color}{' '*((60-len(title))//2)}{title}{' '*((60-len(title))//2)}{Colors.END}")
    print(f"{color}{'='*60}{Colors.END}")

def print_subsection_header(title: str, color: str = Colors.CYAN):
    """พิมพ์หัวข้อย่อย"""
    print(f"\n{color}{Colors.BOLD}{title}{Colors.END}")
    print(f"{color}{'-'*len(title)}{Colors.END}")

def print_key_value(key: str, value: str, key_color: str = Colors.YELLOW, value_color: str = Colors.END):
    """พิมพ์ key-value pair ด้วยสี"""
    print(f"{key_color}{key}:{Colors.END} {value_color}{value}{Colors.END}")

def print_overview(work_package: Dict[str, Any]):
    """แสดงภาพรวมของ Work Package"""
    print_section_header("📋 WORK PACKAGE OVERVIEW", Colors.GREEN)
    
    subject = safe_get(work_package, 'subject')
    status = safe_get(work_package, '_links', 'status', 'title')
    priority = safe_get(work_package, '_links', 'priority', 'title')
    assignee = safe_get(work_package, '_links', 'assignee', 'title')
    
    print(f"{Colors.BOLD}📝 Subject:{Colors.END} {subject}")
    print(f"{Colors.BOLD}📊 Status:{Colors.END} {Colors.GREEN if status == 'ดำเนินการเสร็จ' else Colors.YELLOW}{status}{Colors.END}")
    print(f"{Colors.BOLD}⚡ Priority:{Colors.END} {Colors.RED if priority == 'High' else Colors.YELLOW}{priority}{Colors.END}")
    print(f"{Colors.BOLD}👤 Assignee:{Colors.END} {Colors.CYAN}{assignee}{Colors.END}")
    
    # แสดงวันที่สำคัญ
    created = format_date(safe_get(work_package, 'createdAt'))
    updated = format_date(safe_get(work_package, 'updatedAt'))
    print(f"{Colors.BOLD}📅 Created:{Colors.END} {created}")
    print(f"{Colors.BOLD}🔄 Updated:{Colors.END} {updated}")

def print_work_package_details(work_package: Dict[str, Any]):
    """แสดงรายละเอียด Work Package หลัก"""
    print_section_header("📋 WORK PACKAGE DETAILS", Colors.BLUE)
    
    # ข้อมูลหลัก
    print_subsection_header("📊 Basic Information")
    print_key_value("ID", safe_get(work_package, 'id'), Colors.CYAN)
    print_key_value("Subject", safe_get(work_package, 'subject'), Colors.BOLD)
    print_key_value("Type", safe_get(work_package, '_links', 'type', 'title'))
    print_key_value("Priority", safe_get(work_package, '_links', 'priority', 'title'))
    
    # Description
    description_raw = safe_get(work_package, 'description', 'raw')
    if description_raw and description_raw != "N/A":
        print_subsection_header("📝 Description")
        # ลบ HTML tags และแสดง description ที่อ่านง่าย
        clean_desc = clean_html(description_raw)
        if len(clean_desc) > 150:
            # ถ้ายาวมาก ตัดให้สั้นและเพิ่ม ...
            lines = clean_desc[:150].split('\n')
            for line in lines[:3]:  # แสดงแค่ 3 บรรทัดแรก
                if line.strip():
                    print(f"{Colors.YELLOW}  {line.strip()}{Colors.END}")
            print(f"{Colors.YELLOW}  ... (truncated){Colors.END}")
        else:
            lines = clean_desc.split('\n')
            for line in lines:
                if line.strip():
                    print(f"{Colors.YELLOW}  {line.strip()}{Colors.END}")
    
    # การมอบหมาย
    print_subsection_header("👥 Assignment & Category")
    category = safe_get(work_package, '_links', 'category', 'title')
    assignee = safe_get(work_package, '_links', 'assignee', 'title')
    author = safe_get(work_package, '_links', 'author', 'title')
    
    if category != "N/A":
        print_key_value("Category", category)
    if assignee != "N/A":
        print_key_value("Assignee", assignee, Colors.CYAN)
    if author != "N/A":
        print_key_value("Author", author, Colors.CYAN)
    
    # วันที่
    print_subsection_header("📅 Timeline")
    created_at = format_date(safe_get(work_package, 'createdAt'))
    updated_at = format_date(safe_get(work_package, 'updatedAt'))
    
    print_key_value("Created", created_at, Colors.GREEN)
    print_key_value("Updated", updated_at, Colors.YELLOW)

def print_custom_fields_and_options(client: OpenProjectClient, work_package: Dict[str, Any]):
    """แสดง Custom Fields และ Custom Options"""
    custom_fields = {}
    custom_options = {}
    
    # ดึงข้อมูลจาก customField ปกติ
    for key, value in work_package.items():
        if key.startswith("customField"):
            custom_fields[key] = value
    
    # ดึงข้อมูลจาก _links
    if "_links" in work_package:
        for key, link in work_package["_links"].items():
            if key.startswith("customField"):
                if "href" in link and "/custom_options/" in link["href"]:
                    option_details = client.get_custom_option_details(link["href"])
                    if option_details:
                        custom_options[key] = {
                            "title": option_details.get("title", ""),
                            "value": option_details.get("value", "")
                        }
                elif "title" in link:
                    custom_fields[key] = link["title"]
    
    # แสดงผล Custom Fields
    if custom_fields:
        print_section_header("🏷️ CUSTOM FIELDS", Colors.MAGENTA)
        field_names = {
            "customField4": "Custom Field 4",
            "customField6": "🏢 หน่วยงานที่ตั้ง",
            "customField8": "👤 แจ้งโดย",
            "customField23": "Custom Field 23",
            "customField7": "📞 ผู้แจ้ง (เบอร์โทร)",
            "customField5": "📍 สถานที่",
            "customField10": "📅 วันที่เริ่มต้น",
            "customField2": "🔧 ประเภทงานย่อย Network",
            "customField3": "💻 ประเภทงานย่อย Hardware",
            "customField9": "⚡ ความเร่งด่วน",
            "customField25": "📅 วันที่สิ้นสุด"
        }
        
        for field, value in custom_fields.items():
            field_name = field_names.get(field, field)
            if value and str(value).strip():
                print_key_value(field_name, str(value))
    
    # แสดงผล Custom Options
    if custom_options:
        print_section_header("⚙️ CUSTOM OPTIONS", Colors.MAGENTA)
        option_names = {
            "customField2": "🔧 ประเภทงานย่อย Network",
            "customField3": "💻 ประเภทงานย่อย Hardware",
            "customField9": "⚡ ความเร่งด่วน"
        }
        
        for field, option in custom_options.items():
            option_name = option_names.get(field, field)
            print(f"\n{Colors.BOLD}{option_name}:{Colors.END}")
            
            # แสดง title ถ้ามีข้อมูล
            if option.get('title') and str(option['title']).strip():
                print(f"  {Colors.CYAN}📋 Title:{Colors.END} {option['title']}")
            
            # แสดง value เสมอถ้ามี
            if option.get('value') and str(option['value']).strip():
                print(f"  {Colors.GREEN}🔸 Value:{Colors.END} {option['value']}")
            elif not option.get('title') or not str(option.get('title', '')).strip():
                # ถ้าไม่มี title และไม่มี value แสดงว่าว่างเปล่า
                print(f"  {Colors.YELLOW}⚠️  No data available{Colors.END}")
    else:
        print(f"\n{Colors.YELLOW}ℹ️ No custom options found.{Colors.END}")

def print_activities(client: OpenProjectClient, work_package_id: int):
    """แสดงข้อมูล Activities ในรูปแบบที่อ่านง่าย"""
    print_section_header("📜 ACTIVITY HISTORY", Colors.GREEN)
    
    activities = client.get_activities(work_package_id)
    if not activities:
        print(f"{Colors.RED}❌ ไม่สามารถดึงข้อมูล Activities ได้{Colors.END}")
        return []
    
    print(f"\n{Colors.BOLD}📊 Total Activities: {len(activities)}{Colors.END}\n")
    
    for idx, activity in enumerate(activities, 1):
        print(f"{Colors.CYAN}{'─' * 80}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}Activity #{idx}{Colors.END}")
        print(f"{Colors.CYAN}{'─' * 80}{Colors.END}")
        
        # ข้อมูลผู้ใช้
        user_link = safe_get(activity, '_links', 'user')
        user_name = client.get_user_name(user_link)
        created_at = format_date(safe_get(activity, 'createdAt'))
        
        print(f"{Colors.BOLD}�� User:{Colors.END} {Colors.CYAN}{user_name}{Colors.END}")
        print(f"{Colors.BOLD}📅 Created:{Colors.END} {Colors.GREEN}{created_at}{Colors.END}")
        
        # แสดง Comment ถ้ามี
        comment_raw = safe_get(activity, 'comment', 'raw')
        comment_html = safe_get(activity, 'comment', 'html')
        
        if comment_raw and comment_raw != "N/A":
            print(f"\n{Colors.BOLD}💬 Comment:{Colors.END}")
            print(f"  {Colors.YELLOW}{comment_raw}{Colors.END}")
        elif comment_html and comment_html != "N/A":
            comment_text = clean_html(comment_html)
            if comment_text:
                print(f"\n{Colors.BOLD}💬 Comment:{Colors.END}")
                print(f"  {Colors.YELLOW}{comment_text}{Colors.END}")
        
        # แสดง Changes จาก details
        details = safe_get(activity, 'details', default=[])
        if details:
            print(f"\n{Colors.BOLD}🔄 Changes:{Colors.END}")
            for detail in details:
                html_text = safe_get(detail, 'html')
                if html_text and html_text != "N/A":
                    # ลบ HTML tags และทำความสะอาด
                    clean_text = clean_html(html_text)
                    if clean_text:
                        print(f"  {Colors.BLUE}•{Colors.END} {clean_text}")
        
        print()  # เพิ่มบรรทัดว่าง
    
    return activities

def display_complete_work_package_data(client: OpenProjectClient, work_package_id: int):
    """แสดงข้อมูล Work Package รวมทั้ง Custom Fields และ Activities"""
    work_package = client.get_work_package(work_package_id)
    if not work_package:
        logger.error("No work package data to display")
        return
    
    # แสดงภาพรวมก่อน
    print_overview(work_package)
    
    # แสดงรายละเอียดหลัก
    print_work_package_details(work_package)
    
    # แสดง Custom Fields และ Custom Options
    print_custom_fields_and_options(client, work_package)
    
    # แสดง Activities
    activities = print_activities(client, work_package_id)
    
    # สรุปท้าย
    print_section_header("✅ SUMMARY COMPLETE", Colors.GREEN)
    print(f"{Colors.BOLD}🎉 Successfully displayed complete work package information!{Colors.END}")
    print(f"{Colors.BOLD}📋 Work Package ID:{Colors.END} {work_package_id}")
    print(f"{Colors.BOLD}📊 Total Activities:{Colors.END} {len(activities) if activities else 0}")

if __name__ == "__main__":
    try:
        # โหลดค่าจากไฟล์ .env (ถ้ามี)
        load_dotenv()
        
        # ดึงค่าจาก environment variables (ไม่มี default hardcoded)
        OPENPROJECT_URL = os.getenv("OPENPROJECT_URL")
        OPENPROJECT_API_KEY = os.getenv("OPENPROJECT_API_KEY")
        WORK_PACKAGE_ID_STR = os.getenv("WORK_PACKAGE_ID")
        
        # ตรวจสอบว่าค่าที่จำเป็นมีครบหรือไม่
        if not OPENPROJECT_URL:
            raise ValueError("OPENPROJECT_URL is required. Set it in .env file or environment variable.")
        if not OPENPROJECT_API_KEY:
            raise ValueError("OPENPROJECT_API_KEY is required. Set it in .env file or environment variable.")
        if not WORK_PACKAGE_ID_STR:
            raise ValueError("WORK_PACKAGE_ID is required. Set it in .env file or environment variable.")
        
        try:
            WORK_PACKAGE_ID = int(WORK_PACKAGE_ID_STR)
        except ValueError:
            raise ValueError(f"WORK_PACKAGE_ID must be an integer, got: {WORK_PACKAGE_ID_STR}")

        print(f"🔧 Starting OpenProject data fetcher...")
        print(f"🌐 API URL: {OPENPROJECT_URL}")
        print(f"📋 Work Package ID: {WORK_PACKAGE_ID}")
        
        logger.info("Starting OpenProject data fetcher")
        logger.info(f"Using API URL: {OPENPROJECT_URL}")
        logger.info(f"Work Package ID: {WORK_PACKAGE_ID}")

        client = OpenProjectClient(OPENPROJECT_URL, OPENPROJECT_API_KEY)
        display_complete_work_package_data(client, WORK_PACKAGE_ID)

        logger.info("Finished processing")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        logger.error(f"Main execution error: {e}")
        import traceback
        traceback.print_exc()
