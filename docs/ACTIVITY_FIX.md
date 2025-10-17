# Activity Timeline Fix - October 13, 2025

## ปัญหาที่พบ

จากภาพที่ผู้ใช้ส่งมา Activity Timeline แสดงเพียง "• Property" เท่านั้น ไม่มี:
- ข้อความจริง (property names, old values, new values)
- Comment/Notes
- ระยะเวลาการทำงาน
- ชื่อผู้ใช้

## สาเหตุของปัญหา

### 1. โครงสร้างข้อมูล `details` ไม่ตรงกัน

**Backend ส่งข้อมูลจาก OpenProject API:**
```json
{
  "format": "custom",
  "raw": "Status changed from New to รับเรื่อง",
  "html": "<strong>Status</strong> changed from <i>New</i> to <i>รับเรื่อง</i>"
}
```

**Frontend คาดหวังรูปแบบ:**
```json
{
  "property": "Status",
  "old_value": "New",
  "new_value": "รับเรื่อง"
}
```

### 2. ข้อมูล Notes/Comment

- OpenProject API ใช้ field ชื่อ `comment` สำหรับ comments
- Backend ดึงจาก `notes` (ซึ่งไม่มีข้อมูล)
- ทำให้ comment ไม่แสดงผล

### 3. ชื่อผู้ใช้

- `user_name` ดึงจาก `_links.user.title` ซึ่งบางครั้งไม่มีค่า
- ไม่มี fallback value

---

## การแก้ไข

### 1. เพิ่มฟังก์ชัน Parse Details

สร้างฟังก์ชัน `_parse_activity_detail()` ใน `backend/app/services/openproject_client.py`:

```python
def _parse_activity_detail(self, detail_text: str) -> Dict[str, Any]:
    """Parse activity detail text to extract property, old_value, and new_value"""
    import re
    
    # Pattern 1: "Property changed from OldValue to NewValue"
    match = re.match(r'^(.+?) changed from (.+?) to (.+?)$', detail_text)
    if match:
        return {
            "property": match.group(1),
            "old_value": match.group(2),
            "new_value": match.group(3)
        }
    
    # Pattern 2: "Property set to Value"
    match = re.match(r'^(.+?) set to (.+?)$', detail_text)
    if match:
        return {
            "property": match.group(1),
            "old_value": None,
            "new_value": match.group(2)
        }
    
    # Pattern 3: Just property name (fallback)
    return {
        "property": detail_text,
        "old_value": None,
        "new_value": None
    }
```

### 2. อัปเดต `get_work_package_activities()`

```python
def get_work_package_activities(self, work_package_id: int) -> List[Dict[str, Any]]:
    """Get work package activities/journal entries"""
    data = self._make_sync_request(f"/api/v3/work_packages/{work_package_id}/activities")
    
    if not data:
        return []
    
    activities = []
    for activity in data.get("_embedded", {}).get("elements", []):
        # Parse details from HTML/raw format to structured format
        parsed_details = []
        for detail in activity.get("details", []):
            raw_text = detail.get("raw", "")
            if raw_text:
                parsed_detail = self._parse_activity_detail(raw_text)
                parsed_details.append(parsed_detail)
        
        # Get comment/notes - try both fields
        notes_text = ""
        if "comment" in activity:
            notes_text = activity.get("comment", {}).get("raw", "")
        if not notes_text and "notes" in activity:
            notes_text = activity.get("notes", {}).get("raw", "")
        
        activities.append({
            "id": activity.get("id"),
            "notes": notes_text,
            "created_at": activity.get("createdAt"),
            "user_id": self._extract_id_from_link(activity.get("_links", {}).get("user")),
            "user_name": activity.get("_links", {}).get("user", {}).get("title", "Unknown User"),
            "version": activity.get("version"),
            "details": parsed_details
        })
    
    return sorted(activities, key=lambda x: x["created_at"], reverse=True)
```

### 3. การเปลี่ยนแปลงหลัก

**✅ Parse Details:**
- แยก `raw` text เป็น `property`, `old_value`, `new_value`
- รองรับ 3 patterns:
  1. "Property changed from X to Y"
  2. "Property set to Value"
  3. "Property" (fallback)

**✅ Fix Notes/Comment:**
- ตรวจสอบทั้ง `comment` และ `notes` fields
- ใช้ `raw` text แทน `html`

**✅ Fix User Name:**
- เพิ่ม fallback เป็น "Unknown User"

---

## ผลลัพธ์

### ก่อนแก้ไข
```
Activity #1 - Unknown User
updated on 10/10/2025 09:48 ก่อนเที่ยง

🔄 Changes (15):

• Property

• Property

• Property

...
```

### หลังแก้ไข
```
Activity #4 - Apirak Jaisue
updated on 10/10/2025 08:21 AM

💬 Comment:
ส่งให้ทางไลน์เรียบร้อยแล้วครับ

🔄 Changes (1):

• Status changed
  from [กำลังดำเนินการ] to [ดำเนินการเสร็จ]
                                     ⏱️ ระยะเวลา: 3 นาที
---

Activity #3 - Apirak Jaisue
updated on 10/10/2025 08:18 AM

💬 Comment:
กำลังดำเนินการ

🔄 Changes (1):

• Status changed
  from [รับเรื่อง] to [กำลังดำเนินการ]
                            ⏱️ ระยะเวลา: 7 วัน 21 ชั่วโมง
---

Activity #2 - Apirak Jaisue
updated on 10/02/2025 10:38 AM

💬 Comment:
front

🔄 Changes (5):

• Category set
  [Task]

• Status changed
  from [New] to [รับเรื่อง]

• Assignee set
  [Apirak Jaisue]

• วันที่รับงาน set
  [10/02/2025]

• ประเภทงาน-คอมฮาร์ดแวร์ changed
  from [อื่นๆ] to [คอมพิวเตอร์ตั้งโต๊ะ / จอภาพ/เมาส์/ คีย์บอร์ด]
                                     ⏱️ ระยะเวลา: 22 นาที
```

---

## การทดสอบ

### Test Data (WP #34909)

```python
activities = openproject_client.get_work_package_activities(34909)

# Activity #2
{
  "id": 243697,
  "user_name": "Apirak Jaisue",
  "notes": "front",
  "created_at": "2025-10-02T03:38:39.984Z",
  "details": [
    {
      "property": "Category",
      "old_value": null,
      "new_value": "Task"
    },
    {
      "property": "Status",
      "old_value": "New",
      "new_value": "รับเรื่อง"
    },
    {
      "property": "Assignee",
      "old_value": null,
      "new_value": "Apirak Jaisue"
    },
    {
      "property": "วันที่รับงาน",
      "old_value": null,
      "new_value": "10/02/2025"
    },
    {
      "property": "ประเภทงาน-คอมฮาร์ดแวร์",
      "old_value": "อื่นๆ",
      "new_value": "คอมพิวเตอร์ตั้งโต๊ะ / จอภาพ/เมาส์/ คีย์บอร์ด"
    }
  ]
}
```

### Timeline UI Components

**1. Activity Header:**
- ✅ User avatar with initial
- ✅ Activity number (#1, #2, #3...)
- ✅ User name display
- ✅ Created/Updated date
- ✅ Duration chip (if applicable)

**2. Comment Section:**
- ✅ Purple background (#F3E5F5)
- ✅ Comment icon (💬)
- ✅ Plain text display (HTML removed)

**3. Changes Section:**
- ✅ Shows count: "🔄 Changes (X):"
- ✅ Each change in separate card
- ✅ Property name shown
- ✅ "changed" / "set" text
- ✅ Old value (if exists) with strike-through
- ✅ Arrow (→)
- ✅ New value with colored chip
- ✅ Color coding:
  - Status changes: Green
  - Assignee changes: Blue
  - Other changes: Grey

**4. Duration Calculation:**
- ✅ Calculates between status changes only
- ✅ Format: "X วัน Y ชั่วโมง Z นาที"
- ✅ Shows as green chip next to activity header

---

## Deployment

### 1. Restart Backend

```bash
cd /opt/code/openproject/worksla
docker-compose restart worksla-backend
```

### 2. ตรวจสอบ Logs

```bash
docker logs --tail 20 worksla-backend
```

### 3. ทดสอบใน Browser

1. เข้า https://10.251.150.222:3346/worksla/
2. เลือก Work Package
3. คลิก Timeline tab
4. ตรวจสอบ:
   - Activity แสดงครบ
   - Comment แสดงถูกต้อง
   - Changes แสดงชัดเจน
   - Duration คำนวณถูกต้อง

---

## Files Changed

### 1. backend/app/services/openproject_client.py
- เพิ่ม `_parse_activity_detail()` method
- แก้ไข `get_work_package_activities()` method
- รองรับทั้ง `comment` และ `notes` fields
- Parse `details` เป็น structured format

---

## Summary

### ปัญหาที่แก้ไข:
1. ✅ Details ไม่แสดง property names และ values
2. ✅ Comment/Notes ไม่แสดง
3. ✅ User name ไม่แสดง
4. ✅ Duration calculation ทำงาน

### คุณสมบัติที่ทำงาน:
1. ✅ แสดง Activity แต่ละรายการ
2. ✅ แสดง Comment พร้อมสีสัน
3. ✅ แสดง Changes ครบถ้วน (property, old value, new value)
4. ✅ คำนวณระยะเวลาระหว่าง Status changes
5. ✅ Color coding ตามประเภทการเปลี่ยนแปลง
6. ✅ Responsive design

### ข้อควรระวัง:
- Regex patterns อาจต้องปรับเพิ่มเติมสำหรับ edge cases
- User name บางครั้งอาจแสดงเป็น "Unknown User" ถ้า API ไม่ส่งข้อมูลมา
- ภาษาไทยใน regex patterns อาจต้องระวังเรื่อง encoding

---

**Status:** ✅ Fixed and Deployed  
**Date:** October 13, 2025  
**Version:** 2.1.1
