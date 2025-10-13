# 📱 คู่มือการใช้งาน WorkSLA ระบบใหม่

## 🎯 ภาพรวม

ระบบ WorkSLA ได้รับการออกแบบใหม่ให้มีความทันสมัย สวยงาม และใช้งานง่ายขึ้น โดยเน้น:
- ✨ Material Design 3
- ⏱️ การคำนวณและติดตามเวลาการทำงาน
- 📊 Dashboard สถิติแบบ Real-time
- 📱 Responsive Design (ใช้ได้ทั้ง Desktop และ Mobile)

---

## 🚀 การเข้าถึงระบบ

**URL:** https://10.251.150.222:3346/worksla/

**หน้าหลัก:**
1. Dashboard - `/worksla/dashboard`
2. Work Packages - `/worksla/workpackages`
3. SLA Reports - `/worksla/reports/sla`
4. Admin Settings - `/worksla/admin/settings` (เฉพาะ Admin)

---

## 📋 1. หน้ารายการ Work Packages (Work Packages List)

### ฟีเจอร์หลัก:

#### 📊 Stats Dashboard (ส่วนบน)
แสดงสถิติ Work Packages แบบ Real-time:
- **Total**: จำนวนทั้งหมด
- **New**: งานใหม่
- **In Progress**: กำลังดำเนินการ
- **Completed**: เสร็จแล้ว
- **Closed**: ปิดแล้ว
- **Overdue**: ค้างทำ

#### 🔄 View Toggle
สลับการแสดงผล 2 แบบ:
1. **Grid View** (ค่าเริ่มต้น): แสดงเป็น Cards สวยงาม
   - แต่ละ Card แสดง: WP ID, Subject, Status, Priority, Assignee, Due Date
   - Hover เพื่อดู effect และ shadow
   - คลิกที่ Card เพื่อดูรายละเอียด

2. **List View**: แสดงเป็นตาราง Compact
   - เหมาะสำหรับดูข้อมูลจำนวนมาก
   - แสดงข้อมูลหลัก: ID, Subject, Status, Priority, Assignee

#### 🔍 Filters & Search
- **Status Filter**: กรองตามสถานะ (All, New, In Progress, Completed, Closed)
- **Search**: ค้นหาจาก Subject
- **Sort**: เรียงลำดับตามวันที่อัปเดต (ใหม่ → เก่า)

#### 🎨 Status Colors
- **New** (ใหม่): สีฟ้าอ่อน
- **รับเรื่อง**: สีส้ม
- **กำลังดำเนินการ**: สีน้ำเงิน
- **ดำเนินการเสร็จ**: สีเขียว
- **ปิดงาน**: สีเทา

#### 🚦 Priority Indicators
- **High**: สีแดง (🔴)
- **Normal**: สีส้ม (🟠)
- **Low**: สีเขียว (🟢)

---

## 📝 2. หน้ารายละเอียด Work Package (Detail Page)

### การเข้าถึง:
- คลิกที่ Work Package Card ในหน้ารายการ
- หรือ URL: `/worksla/workpackages/{id}`

### โครงสร้าง:

#### Header
- **Breadcrumb**: Work Packages > #{WP_ID}
- **หัวเรื่อง**: #{WP_ID} - {Subject}
- **Status Chip**: แสดงสถานะปัจจุบันพร้อมสี
- **ปุ่มกลับ**: กลับไปหน้ารายการ

#### 📑 2 Tabs หลัก

---

### Tab 1: 📋 ภาพรวม (Overview)

แบ่งเป็น 2 คอลัมน์:

#### ซ้าย (8 คอลัมน์):
**รายละเอียด**
- คำอธิบาย (Description)
- Custom Fields (ถ้ามี)
  - แสดงเป็น Grid Cards
  - แต่ละ Field แสดงชื่อและค่า

#### ขวา (4 คอลัมน์):
**ข้อมูลสำคัญ** (4 Cards แยกกัน)

1. **👤 ผู้รับผิดชอบ (Assignee)**
   - Avatar พร้อมชื่อ
   - ถ้าไม่มี: "ยังไม่ได้กำหนด"

2. **📅 วันที่ (Dates)**
   - สร้างเมื่อ: วันที่ + เวลา
   - อัปเดตล่าสุด: วันที่ + เวลา
   - กำหนดส่ง: วันที่ (ถ้ามี - แสดงเป็นสีแดง)

3. **🚦 ลำดับความสำคัญ (Priority)**
   - Chip แสดงระดับพร้อมสี
   - High/Normal/Low

4. **📂 ประเภท (Type)**
   - แสดงประเภท WP (เช่น Task, Bug, Feature)

---

### Tab 2: ⏱️ Timeline (Activity Timeline)

แสดงประวัติการเปลี่ยนแปลงทั้งหมดแบบ Timeline

#### โครงสร้าง Timeline:

```
[Date & Time]    [Icon]    [Activity Details]
   ↓               ↓              ↓
   |               ●        ┌─────────────┐
   |               │        │ User Info   │
[Duration]         │        │ Comments    │
   |               │        │ Changes     │
   |               │        └─────────────┘
   ↓               ↓
```

#### ส่วนประกอบแต่ละ Activity:

**1. ด้านซ้าย (Date & Duration):**
- วันที่: "13 ต.ค. 2025"
- เวลา: "14:30 น."
- เวลาที่ผ่านมา: "2 ชั่วโมงที่แล้ว"
- **Duration Chip**: ระยะเวลาถึง Activity ถัดไป
  - เช่น: "2 วัน 5 ชม."
  - สีน้ำเงิน พร้อมไอคอนนาฬิกา

**2. ตรงกลาง (Icon Avatar):**
- Avatar กลมพร้อมไอคอนตามประเภท:
  - 🔄 เปลี่ยนสถานะ (Status Change) - สีตามสถานะ
  - 💬 ความคิดเห็น (Comment) - สีม่วง
  - 👤 เปลี่ยนผู้รับผิดชอบ (Assignee)
  - 🚦 เปลี่ยนความสำคัญ (Priority)
  - ℹ️ ข้อมูลทั่วไป (Info) - สีเทา
- เส้นเชื่อมต่อระหว่าง Activities

**3. ด้านขวา (Activity Card):**

**Header:**
- User Avatar + ชื่อผู้ใช้
- เวอร์ชัน (Version number)

**Content (แสดงตามที่มี):**

a) **💬 ความคิดเห็น (Comments):**
   - แสดงใน Paper พื้นสีเทาอ่อน
   - มีเส้นขอบด้านซ้ายสีน้ำเงิน
   - รองรับ HTML content

b) **🔄 การเปลี่ยนแปลง (Changes):**
   - แสดงเป็นรายการ
   - แต่ละการเปลี่ยนแปลงแสดง:
     - ชื่อ property ที่เปลี่ยน
     - **Before (Old Value)**: Chip สีเทา ขีดฆ่า
     - ลูกศร: →
     - **After (New Value)**: Chip สีตามสถานะ มี shadow

**ตัวอย่าง Changes:**

```
Status
[รับเรื่อง] → [กำลังดำเนินการ]
   (สีเทา)        (สีน้ำเงิน)

Priority  
[Normal] → [High]
  (สีส้ม)    (สีแดง)
```

---

## ⏰ การคำนวณเวลา (Duration Calculation)

### Duration Chips แสดงระยะเวลาระหว่าง Activities:

**รูปแบบ:**
- **มากกว่า 1 วัน**: "X วัน Y ชม."
  - ตัวอย่าง: "2 วัน 5 ชม."
  
- **มากกว่า 1 ชั่วโมง**: "X ชม. Y นาที"
  - ตัวอย่าง: "3 ชม. 25 นาที"
  
- **น้อยกว่า 1 ชั่วโมง**: "X นาที"
  - ตัวอย่าง: "45 นาที"

**Relative Time:**
- "2 ชั่วโมงที่แล้ว"
- "3 วันที่แล้ว"
- "เมื่อสักครู่"

---

## 🎨 Color Code System

### Status Colors:
| สถานะ | สีพื้น | ความหมาย |
|------|-------|---------|
| New / ใหม่ | ฟ้าอ่อน | เพิ่งสร้าง ยังไม่มีคนรับ |
| รับเรื่อง | ส้ม | มีคนรับแล้ว ยังไม่ได้เริ่มทำ |
| กำลังดำเนินการ | น้ำเงิน | กำลังทำอยู่ |
| ดำเนินการเสร็จ | เขียว | ทำเสร็จแล้ว |
| ปิดงาน / Closed | เทา | ปิดงานแล้ว |

### Priority Colors:
| ระดับ | สี | Icon |
|------|---|------|
| High | แดง | 🔴 |
| Normal | ส้ม | 🟠 |
| Low | เขียว | 🟢 |

### Activity Icon Colors:
| ประเภท | สี | ความหมาย |
|--------|---|---------|
| Status Change (ดำเนินการเสร็จ) | เขียว | เปลี่ยนเป็นสถานะเสร็จ |
| Status Change (กำลังดำเนินการ) | น้ำเงิน | เปลี่ยนเป็นกำลังทำ |
| Status Change (รับเรื่อง) | ส้ม | มีคนรับเรื่อง |
| Comment | ม่วง | เพิ่มความคิดเห็น |
| Other Changes | เทา | การเปลี่ยนแปลงอื่นๆ |

---

## 📱 Responsive Design

### Desktop (> 900px):
- Grid View: 3 columns
- Timeline: แสดง date ด้านซ้าย
- Sidebar เมนูแบบเต็ม

### Tablet (600-900px):
- Grid View: 2 columns
- Timeline: แสดง date ด้านซ้าย
- Sidebar ยุบได้

### Mobile (< 600px):
- Grid View: 1 column
- Timeline: date แสดงด้านบน
- Sidebar แบบ drawer

---

## 🔍 Tips การใช้งาน

### 1. หน้ารายการ:
- ใช้ **Grid View** เมื่อต้องการภาพรวมที่สวยงาม
- ใช้ **List View** เมื่อต้องการดูข้อมูลเยอะๆ
- กรองด้วย **Status Filter** เพื่อเห็นงานแต่ละประเภท
- ใช้ **Search** ค้นหาชื่อ WP โดยตรง

### 2. หน้ารายละเอียด:
- เปิด **Overview Tab** ก่อนเพื่อดูข้อมูลพื้นฐาน
- เปิด **Timeline Tab** เพื่อดูประวัติการทำงาน
- สังเกต **Duration Chips** เพื่อดูว่างานค้างนานแค่ไหน
- อ่าน **Comments** เพื่อเข้าใจบริบทงาน
- ดู **Changes** เพื่อติดตามความคืบหน้า

### 3. Timeline:
- Activities เรียงจาก **ใหม่ → เก่า** (บนลงล่าง)
- **Duration Chip** แสดงระยะเวลาถึง Activity ถัดไป
- **สีของ Icon** บอกประเภทกิจกรรม
- **Before → After Chips** แสดงการเปลี่ยนแปลงชัดเจน

---

## ⚡ Keyboard Shortcuts

| คีย์ | การทำงาน |
|-----|---------|
| `Esc` | ปิด Dialog หรือกลับหน้าก่อน |
| `Ctrl + K` | เปิด Search (ถ้ามี) |
| `F5` | Refresh หน้า |

---

## 🐛 แก้ปัญหา

### หน้าจอว่างเปล่า:
1. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
2. ล็อกอินใหม่
3. Clear browser cache (Ctrl + Shift + Delete)
4. ติดต่อ Admin

### ข้อมูลไม่แสดง:
1. Refresh หน้า (F5)
2. ตรวจสอบสิทธิ์การเข้าถึง
3. ตรวจสอบว่ามี Work Packages ในระบบหรือไม่

### Timeline ไม่แสดง:
1. ตรวจสอบว่า WP มี Activities หรือไม่
2. Refresh หน้า
3. ดู Console (F12) เพื่อตรวจสอบ errors

---

## 📞 ติดต่อ Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:
- **Email**: support@worksla.local
- **Phone**: xxx-xxx-xxxx
- **Admin Panel**: https://10.251.150.222:3346/worksla/admin/settings

---

## 🎓 เอกสารเพิ่มเติม

- [USER_GUIDE.md](./USER_GUIDE.md) - คู่มือผู้ใช้ฉบับเต็ม
- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) - คู่มือ Admin
- [API.md](./API.md) - เอกสาร API
- [REDESIGN_SUMMARY.md](./REDESIGN_SUMMARY.md) - สรุปการออกแบบใหม่

---

**อัปเดตล่าสุด:** 13 ตุลาคม 2025  
**เวอร์ชัน:** 2.0 (UI Redesign)
