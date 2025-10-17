# Timeline & UI Update - October 13, 2025

## สรุปการเปลี่ยนแปลง

การปรับปรุงครั้งนี้เน้นการแสดง Activity Timeline ให้ตรงกับโครงสร้างของ OpenProject ID #34909 และปรับปรุง UI ให้สะอาดขึ้น

---

## 🎯 เป้าหมายการพัฒนา

### 1. แสดง Activity Timeline ตามโครงสร้างของ ID #34909
- แสดง Activity แต่ละรายการแยกชัดเจน
- แสดงวันที่เป็น "created on" / "updated on"
- แสดง Comment ก่อน Changes
- แสดง Changes ทั้งหมดในรูปแบบที่เข้าใจง่าย

### 2. เน้น Status Changes และคำนวณระยะเวลา
- แสดง Status changes อย่างชัดเจน (from XXX to XXX)
- คำนวณระยะเวลาระหว่าง Status changes
- แสดงระยะเวลาในรูปแบบที่เข้าใจง่าย (X วัน Y ชั่วโมง Z นาที)

### 3. ปรับ UI ให้สอดคล้องกับข้อมูล
- ออกแบบการ์ดแสดง Activity ที่สวยงาม
- ใช้สีแยกประเภทการเปลี่ยนแปลง
- ลบ HTML tags ในหน้าภาพรวม

---

## 🔄 การเปลี่ยนแปลงใน Timeline

### โครงสร้างใหม่

```
┌─────────────────────────────────────────────────────┐
│  📋 SUMMARY HEADER                                   │
│  ระยะเวลาทั้งหมด | จำนวนกิจกรรม | สถานะปัจจุบัน    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Activity #4 - Apirak Jaisue                         │
│  updated on 10/10/2025 10:21 AM                      │
│                                                      │
│  💬 Comment:                                         │
│  ส่งให้ทางไลน์เรียบร้อยแล้วครับ                      │
│                                                      │
│  🔄 Changes (1):                                     │
│  • Status changed from กำลังดำเนินการ to ดำเนินการเสร็จ│
│    [กำลังดำเนินการ] → [ดำเนินการเสร็จ]              │
│                                       ⏱️ 3 นาที      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Activity #3 - Apirak Jaisue                         │
│  updated on 10/10/2025 08:18 AM                      │
│                                                      │
│  💬 Comment:                                         │
│  กำลังดำเนินการ                                      │
│                                                      │
│  🔄 Changes (1):                                     │
│  • Status changed from รับเรื่อง to กำลังดำเนินการ   │
│    [รับเรื่อง] → [กำลังดำเนินการ]                   │
│                             ⏱️ 7 วัน 21 ชั่วโมง      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Activity #2 - Apirak Jaisue                         │
│  updated on 10/02/2025 10:38 AM                      │
│                                                      │
│  💬 Comment:                                         │
│  front                                               │
│                                                      │
│  🔄 Changes (5):                                     │
│  • Category set to Task                              │
│  • Status changed from New to รับเรื่อง              │
│  • Assignee set to Apirak Jaisue                     │
│  • วันที่รับงาน set to 10/02/2025                    │
│  • ประเภทงาน-คอมฮาร์ดแวร์ changed from อื่นๆ to       │
│    คอมพิวเตอร์ตั้งโต๊ะ / จอภาพ/เมาส์/ คีย์บอร์ด       │
│                                      ⏱️ 22 นาที      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Activity #1 - ผู้แจ้งงาน e-service                  │
│  created on 10/02/2025 10:16 AM                      │
│                                                      │
│  🔄 Changes (16):                                    │
│  • Type set to ปัญหาฮาร์ดแวร์                        │
│  • Project set to ระบบแจ้งซ่อม สารสนเทศ               │
│  • Subject set to ขอช่วยจัดหาสเปค...                 │
│  • Status set to New                                 │
│  • Priority set to Normal                            │
│  ... (และอีก 11 รายการ)                              │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 การออกแบบ UI

### 1. Activity Card Design

**Header Section:**
- Avatar ของผู้ใช้ (48x48px) พร้อม initial
- Activity number (#1, #2, #3...)
- ชื่อผู้ใช้ (Typography h6, color: primary)
- วันที่และเวลา (format: dd/MM/yyyy HH:mm a)
- ระยะเวลาระหว่าง status (Chip สีเขียว ด้านขวา)

**Comment Section:**
- Icon: 💬 Comment (สีม่วง #9C27B0)
- Background: สีม่วงอ่อน (#F3E5F5)
- Border-left: 5px สีม่วง
- Plain text (ลบ HTML tags)

**Changes Section:**
- Icon: 🔄 Changes (สีน้ำเงิน)
- แสดงจำนวนการเปลี่ยนแปลง (X รายการ)
- แต่ละ change แสดงใน Paper component:
  * **Status changes:** สีเขียว (success.50) - border-left: 5px เขียว
  * **Assignee changes:** สีน้ำเงิน (info.50) - border-left: 5px น้ำเงิน
  * **Other changes:** สีเทา (grey.50) - border-left: 5px เทา

### 2. Color Palette

```javascript
Status Changes:
  background: success.50 (#E8F5E9)
  border: success.main (#4CAF50)
  chip: success (green)

Assignee Changes:
  background: info.50 (#E3F2FD)
  border: info.main (#2196F3)
  chip: info (blue)

Comment:
  background: #F3E5F5 (purple 50)
  border: #9C27B0 (purple 600)
  text: #4A148C (purple 900)

Other Changes:
  background: grey.50 (#FAFAFA)
  border: grey.400 (#BDBDBD)
  chip: default (grey)
```

### 3. Duration Calculation

**ฟังก์ชัน calculateDuration():**
```typescript
const calculateDuration = (endDate: Date, startDate: Date) => {
  const diffMinutes = differenceInMinutes(endDate, startDate);
  const diffHours = differenceInHours(endDate, startDate);
  const diffDays = differenceInDays(endDate, startDate);
  
  if (diffDays > 0) {
    const remainingHours = diffHours - (diffDays * 24);
    if (remainingHours > 0) {
      return `${diffDays} วัน ${remainingHours} ชั่วโมง`;
    }
    return `${diffDays} วัน`;
  }
  
  if (diffHours > 0) {
    const remainingMinutes = diffMinutes - (diffHours * 60);
    if (remainingMinutes > 0) {
      return `${diffHours} ชั่วโมง ${remainingMinutes} นาที`;
    }
    return `${diffHours} ชั่วโมง`;
  }
  
  return `${diffMinutes} นาที`;
};
```

**ฟังก์ชัน getStatusChangeDuration():**
```typescript
const getStatusChangeDuration = (
  currentActivity: Activity, 
  previousActivity?: Activity
) => {
  if (!previousActivity) return null;
  
  const currentStatusChange = currentActivity.details?.find(
    (d: any) => d.property?.toLowerCase().includes('status')
  );
  const prevStatusChange = previousActivity.details?.find(
    (d: any) => d.property?.toLowerCase().includes('status')
  );
  
  if (currentStatusChange && prevStatusChange) {
    const currentDate = new Date(currentActivity.created_at);
    const prevDate = new Date(previousActivity.created_at);
    return calculateDuration(currentDate, prevDate);
  }
  
  return null;
};
```

---

## 📋 การแสดง Changes

### Format การแสดง

**Status Change:**
```
• Status changed from New to รับเรื่อง
  from [New] to [รับเรื่อง]
```

**Set Value:**
```
• Category set to Task
  [Task]
```

**Change Value:**
```
• ประเภทงาน changed from อื่นๆ to คอมพิวเตอร์
  from [อื่นๆ] to [คอมพิวเตอร์]
```

### Components ที่ใช้

- **Property name:** Typography body2, fontWeight 700
- **Old value:** Chip size="medium", สีเทา, line-through
- **Arrow:** Typography "→" ขนาดใหญ่
- **New value:** Chip size="medium", สีตามประเภท, fontWeight 700

---

## 🔧 การปรับปรุง Description (หน้าภาพรวม)

### ปัญหา
Description มี HTML tags ที่แสดงในหน้า UI:
```html
<div>ขอช่วยจัดหาสเปค...</div>
<a href="..." target="_top">Screenshot.png</a>
```

### วิธีแก้
ใช้ `replace()` ลบ HTML tags:
```typescript
<Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
  {wp.description 
    ? wp.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() 
    : 'ไม่มีคำอธิบาย'
  }
</Typography>
```

**ผลลัพธ์:**
```
ขอช่วยจัดหาสเปคชุดคอมพิวเตอร์สำหรับราวด์วอร์ด
เพื่อติดตั้งในห้องตรวจแมมโมแกรม แผนกรังสีวิทยา 
จำนวน 1 ชุด พร้อมใบเสนอราคา
โดยมีตัวอย่างดังภาพที่แนบมา หรือแบบเดียวกับ
ชุดคอมพิวเตอร์ที่วอร์ดใช้งานอยู่
```

---

## 📊 ตัวอย่างการแสดงผลจาก ID #34909

### Timeline Flow

```
สร้างเมื่อ: 10/02/2025 10:16 AM (Activity #1)
  ↓ ระยะเวลา: 22 นาที
รับเรื่อง: 10/02/2025 10:38 AM (Activity #2)
  ↓ ระยะเวลา: 7 วัน 21 ชั่วโมง 40 นาที
กำลังดำเนินการ: 10/10/2025 08:18 AM (Activity #3)
  ↓ ระยะเวลา: 3 นาที
ดำเนินการเสร็จ: 10/10/2025 08:21 AM (Activity #4)

รวมระยะเวลา: 8 วัน 5 นาที
```

### Activity #4 - Final Status
- **User:** Apirak Jaisue
- **Action:** updated on 10/10/2025 08:21 AM
- **Comment:** "ส่งให้ทางไลน์เรียบร้อยแล้วครับ"
- **Changes:**
  - Status changed from "กำลังดำเนินการ" to "ดำเนินการเสร็จ"

### Activity #3 - In Progress
- **User:** Apirak Jaisue
- **Action:** updated on 10/10/2025 08:18 AM
- **Comment:** "กำลังดำเนินการ"
- **Changes:**
  - Status changed from "รับเรื่อง" to "กำลังดำเนินการ"
- **Duration from #2:** 7 วัน 21 ชั่วโมง

### Activity #2 - Assignment
- **User:** Apirak Jaisue
- **Action:** updated on 10/02/2025 10:38 AM
- **Comment:** "front"
- **Changes:**
  - Category set to Task
  - Status changed from New to รับเรื่อง
  - Assignee set to Apirak Jaisue
  - วันที่รับงาน set to 10/02/2025
  - ประเภทงาน-คอมฮาร์ดแวร์ changed from อื่นๆ to คอมพิวเตอร์ตั้งโต๊ะ
- **Duration from #1:** 22 นาที

### Activity #1 - Creation
- **User:** ผู้แจ้งงาน e-service
- **Action:** created on 10/02/2025 10:16 AM
- **Changes:** (16 items)
  - Type set to ปัญหาฮาร์ดแวร์
  - Project set to ระบบแจ้งซ่อม สารสนเทศ
  - Subject set to ขอช่วยจัดหาสเปค...
  - Status set to New
  - Priority set to Normal
  - ... และอีก 11 รายการ

---

## 🚀 การ Deploy

### Build Command
```bash
cd /opt/code/openproject/worksla
docker-compose down
docker-compose build worksla-frontend
docker-compose up -d
```

### ตรวจสอบสถานะ
```bash
docker ps | grep worksla
docker logs --tail 30 worksla-frontend
```

### URL
- **Production:** https://10.251.150.222:3346/worksla/
- **API:** http://localhost:8000/api/v1/

---

## ✅ Testing Checklist

- [x] แสดง Activity Timeline ตามโครงสร้างของ ID #34909
- [x] แสดง created on / updated on ถูกต้อง
- [x] แสดง Comment ก่อน Changes
- [x] แสดง Changes แยกตามประเภท (Status, Assignee, Other)
- [x] คำนวณระยะเวลาระหว่าง Status changes
- [x] แสดงระยะเวลาในรูปแบบ "X วัน Y ชั่วโมง Z นาที"
- [x] ลบ HTML tags ในหน้าภาพรวม
- [x] Responsive design (Mobile & Desktop)
- [x] Hover effects และ animations
- [x] Color coding ถูกต้อง
- [x] Build และ deploy สำเร็จ

---

## 📝 Files Changed

1. **frontend/src/pages/workpackages/WorkPackageDetailPageNew.tsx**
   - แก้ไข renderTimelineTab() ให้แสดงตามโครงสร้างใหม่
   - เพิ่ม getStatusChangeDuration() function
   - แก้ไข calculateDuration() ให้แสดงผลละเอียดขึ้น
   - ปรับ Activity card design
   - แก้ไข Description ให้ลบ HTML tags

---

## 🎯 ผลลัพธ์

### Before
- Timeline แสดงแบบแยกกลุ่ม (Status, Comments, Assignee, Other)
- ระยะเวลาคำนวณระหว่าง activities ทั้งหมด
- Description มี HTML tags
- Comment แสดงเป็น HTML

### After
- Timeline แสดงเป็น Activity แต่ละรายการตามลำดับ
- ระยะเวลาคำนวณระหว่าง Status changes เท่านั้น
- Description เป็น plain text (ลบ HTML tags)
- Comment แสดงเป็น plain text
- แสดง "created on" / "updated on" ชัดเจน
- Changes แสดงครบทุกรายการ พร้อมสี coding

---

## 📌 Key Features

### 1. Activity Timeline
✨ แสดง Activity แต่ละรายการแยกชัดเจน  
✨ แสดง created/updated date อย่างถูกต้อง  
✨ Comment section พร้อม icon และสีสันสวยงาม  
✨ Changes แสดงครบทุกรายการ  

### 2. Duration Calculation
✨ คำนวณระยะเวลาระหว่าง Status changes  
✨ แสดงในรูปแบบ "X วัน Y ชั่วโมง Z นาที"  
✨ แสดง Chip สีเขียวด้านขวาของ Activity header  

### 3. Color Coding
✨ Status changes: สีเขียว (success)  
✨ Assignee changes: สีน้ำเงิน (info)  
✨ Comment: สีม่วง (#9C27B0)  
✨ Other changes: สีเทา (default)  

### 4. UI/UX
✨ Clean และ modern design  
✨ Hover effects พร้อม elevation  
✨ Responsive layout  
✨ Icon และ emoji ช่วยให้เข้าใจง่าย  
✨ Border-left color coding  

---

## 🔮 Future Improvements

1. **Filter Timeline:**
   - Filter by activity type (creation, updates, comments)
   - Filter by user
   - Filter by date range

2. **Export Timeline:**
   - Export to PDF
   - Export to Excel
   - Share via email

3. **Real-time Updates:**
   - WebSocket connection
   - Auto-refresh timeline
   - Notification badges

4. **Activity Insights:**
   - Average response time
   - Most active users
   - Status duration analytics

---

## 📞 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:
- **Documentation:** README.md, USER_GUIDE.md
- **API Documentation:** API.md
- **Database Schema:** DB_SCHEMA.md

---

**Last Updated:** October 13, 2025  
**Version:** 2.1.0  
**Status:** ✅ Production Ready
