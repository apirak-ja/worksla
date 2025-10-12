# User Guide

คู่มือการใช้งานระบบ WorkSLA สำหรับผู้ใช้ทั่วไป

---

## สารบัญ

- [การเข้าสู่ระบบ](#การเข้าสู่ระบบ)
- [Dashboard](#dashboard)
- [Work Packages](#work-packages)
- [Reports](#reports)
- [Search](#search)
- [Profile Settings](#profile-settings)

---

## การเข้าสู่ระบบ

### 1. เปิดเบราว์เซอร์

เข้าสู่:
```
https://10.251.150.222:3346/worksla/
```

### 2. ยอมรับ Certificate

คุณจะเห็นคำเตือนเกี่ยวกับ security certificate:

**Chrome/Edge:**
1. คลิก "Advanced"
2. คลิก "Proceed to 10.251.150.222 (unsafe)"

**Firefox:**
1. คลิก "Advanced"
2. คลิก "Accept the Risk and Continue"

> ℹ️ **หมายเหตุ:** Certificate warning ปรากฏเพราะเป็น self-signed certificate สำหรับใช้ภายในองค์กร ปลอดภัยในการใช้งาน

### 3. กรอกข้อมูลเข้าสู่ระบบ

- **Username**: ชื่อผู้ใช้ที่ได้รับจาก Admin
- **Password**: รหัสผ่านของคุณ

คลิก "Sign In"

---

## Dashboard

หน้า Dashboard แสดงภาพรวมของ Work Packages

### KPI Cards

แสดงตัวเลขสำคัญ 4 ตัว:

1. **Total Work Packages** 📊
   - จำนวน Work Packages ทั้งหมดในระบบ

2. **Overdue** 🚨
   - งานที่เกินกำหนดส่ง

3. **Due Soon (7 days)** ⏰
   - งานที่จะครบกำหนดใน 7 วันข้างหน้า

4. **Completed** ✅
   - งานที่เสร็จสมบูรณ์แล้ว

### สถิติแบ่งตาม Status และ Priority

- **By Status**: จำนวนงานแยกตามสถานะ
- **By Priority**: จำนวนงานแยกตามระดับความสำคัญ

### รายการงาน Overdue และ Due Soon

- แสดง 5 งานแรกที่เกินกำหนดและใกล้ครบกำหนด
- คลิกที่งานเพื่อดูรายละเอียด

### ปุ่ม Refresh

คลิกเพื่อโหลดข้อมูลใหม่

---

## Work Packages

### เข้าสู่หน้า Work Packages

คลิก "Work Packages" จากเมนูด้านซ้าย

### ตารางแสดงข้อมูล

แสดงรายการ Work Packages ทั้งหมดในรูปแบบตาราง:

| คอลัมน์ | คำอธิบาย |
|---------|----------|
| ID | รหัส Work Package |
| Subject | หัวข้อ/ชื่องาน |
| Type | ประเภทงาน |
| Status | สถานะปัจจุบัน |
| Priority | ระดับความสำคัญ |
| Assignee | ผู้รับผิดชอบ |
| Due Date | วันที่ครบกำหนด |
| Actions | ปุ่มดูรายละเอียด |

### การค้นหาและกรองข้อมูล

#### Search Box
พิมพ์คำค้นหาเพื่อค้นหาจาก:
- หัวข้องาน (Subject)
- ชื่อผู้รับผิดชอบ (Assignee)

#### Filter Dropdown

**Status:**
- All (ทั้งหมด)
- New (ใหม่)
- In Progress (กำลังดำเนินการ)
- Closed (ปิดแล้ว)

**Priority:**
- All
- High (สูง)
- Normal (ปกติ)
- Low (ต่ำ)

**Type:**
- All
- Task (งาน)
- Bug (ข้อผิดพลาด)
- Feature (คุณสมบัติ)

### การเรียงลำดับ (Sort)

คลิกที่หัวคอลัมน์เพื่อเรียงลำดับ:
- ↑ เรียงจากน้อยไปมาก (A-Z, 0-9)
- ↓ เรียงจากมากไปน้อย (Z-A, 9-0)

### Pagination

- เลือกจำนวนแถวต่อหน้า: 25, 50, 100
- คลิกปุ่ม Previous/Next เพื่อเปลี่ยนหน้า

### การดูรายละเอียด Work Package

1. คลิกปุ่ม "View" ในคอลัมน์ Actions
2. หรือคลิกที่หมายเลข ID

---

## Work Package Detail

หน้ารายละเอียดแสดงข้อมูลครบถ้วนของ Work Package

### ข้อมูลหลัก

- **Subject**: หัวข้องาน
- **Status**: สถานะปัจจุบัน (แสดงเป็น badge สี)
- **Priority**: ระดับความสำคัญ (แสดงเป็น badge สี)
- **Type**: ประเภทงาน

### ข้อมูลเพิ่มเติม

- **Assignee**: ผู้รับผิดชอบ
- **Project**: โปรเจกต์ที่งานนี้สังกัด
- **Due Date**: วันที่ครบกำหนด
- **Created**: วันที่สร้างงาน
- **Updated**: วันที่อัปเดตล่าสุด

### ปุ่ม "Open in OpenProject"

คลิกเพื่อเปิดดูใน OpenProject (เปิด tab ใหม่)

### Additional Details

แสดงข้อมูลดิบในรูปแบบ JSON (สำหรับผู้ใช้ขั้นสูง)

---

## Reports

### เข้าสู่หน้า Reports

คลิก "Reports" จากเมนูด้านซ้าย

### ประเภทรายงาน

#### 1. SLA Report

รายงานการปฏิบัติตาม SLA (Service Level Agreement)

**ตัวเลือก:**
- Start Date: วันที่เริ่มต้น
- End Date: วันที่สิ้นสุด
- Assignee: ผู้รับผิดชอบ (ตัวเลือก)
- Project: โปรเจกต์ (ตัวเลือก)

**ข้อมูลที่แสดง:**
- จำนวนงานทั้งหมด
- งานที่ส่งทันเวลา
- งานที่เกินกำหนด
- % SLA

**Export:**
- PDF
- CSV

#### 2. Productivity Report

รายงานผลผลิตแยกตามผู้รับผิดชอบหรือโปรเจกต์

**ตัวเลือก:**
- Start Date / End Date
- Group by: Assignee หรือ Project

**ข้อมูลที่แสดง:**
- จำนวนงานทั้งหมด
- งานที่เสร็จสมบูรณ์
- งานที่กำลังดำเนินการ
- งานที่เกินกำหนด

### การใช้งาน

1. เลือกประเภทรายงาน
2. กรอกตัวเลือก (วันที่, ผู้รับผิดชอบ, ฯลฯ)
3. คลิก "Generate Report"
4. ดูรายงานบนหน้าจอ
5. Export เป็น PDF หรือ CSV (ถ้าต้องการ)

---

## Search

### Global Search

ค้นหาข้อมูล Work Packages จากทุกที่ในระบบ

**วิธีใช้:**

1. คลิกไอคอน 🔍 ที่มุมขวาบน (ถ้ามี)
2. หรือใช้ Search box ในหน้า Work Packages
3. พิมพ์คำค้นหา (ขั้นต่ำ 2 ตัวอักษร)
4. ระบบจะค้นหาจาก:
   - หัวข้องาน (Subject)
   - รายละเอียด
   - ชื่อผู้รับผิดชอบ

**ผลลัพธ์:**
- แสดงรายการที่ตรงตามคำค้นหา
- คลิกเพื่อดูรายละเอียด

---

## Profile Settings

### เข้าสู่ Profile

1. คลิกที่ Avatar (วงกลม) มุมขวาบน
2. คลิก "Profile" (ถ้ามี)

### เปลี่ยนรหัสผ่าน

1. เข้า Profile Settings
2. กรอก:
   - Current Password (รหัสผ่านปัจจุบัน)
   - New Password (รหัสผ่านใหม่)
   - Confirm Password (ยืนยันรหัสผ่านใหม่)
3. คลิก "Change Password"

**ข้อกำหนดรหัสผ่าน:**
- ความยาวขั้นต่ำ 8 ตัวอักษร
- แนะนำให้ใช้ตัวพิมพ์ใหญ่-เล็ก ตัวเลข และสัญลักษณ์

---

## Tips & Tricks

### ⌨️ Keyboard Shortcuts

- `Ctrl + K`: Global search (ถ้ามี)
- `Ctrl + R`: Refresh หน้าปัจจุบัน
- `Esc`: ปิด dialogs

### 📱 Mobile Access

ระบบรองรับการใช้งานบนมือถือ:
- เมนูจะแสดงเป็น hamburger menu (☰)
- ตารางปรับขนาดอัตโนมัติ
- ใช้ swipe เพื่อเลื่อนตาราง

### 💡 Best Practices

1. **Refresh เป็นระยะ**
   - ข้อมูลจะอัปเดตทุก 30-120 วินาที
   - คลิก Refresh เพื่อดูข้อมูลล่าสุด

2. **ใช้ Filters**
   - ประหยัดเวลาในการค้นหา
   - Filter ตามสถานะที่สนใจ

3. **Export ข้อมูล**
   - Export เป็น CSV เพื่อวิเคราะห์ใน Excel
   - ใช้ Reports สำหรับ presentation

4. **Bookmark**
   - บันทึก URL ของ filter ที่ใช้บ่อย
   - เพิ่ม bookmarks ในเบราว์เซอร์

---

## FAQ (คำถามที่พบบ่อย)

### Q: ทำไมเห็นคำเตือน certificate?

**A:** เป็นเรื่องปกติ เพราะระบบใช้ self-signed certificate สำหรับใช้งานภายในองค์กร ปลอดภัยในการใช้งาน คลิก "Advanced" และ "Proceed" เพื่อดำเนินการต่อ

### Q: ลืมรหัสผ่านทำอย่างไร?

**A:** ติดต่อ Admin เพื่อขอ reset รหัสผ่าน

### Q: ข้อมูลไม่อัปเดต?

**A:** คลิกปุ่ม Refresh หรือกด F5 บนเบราว์เซอร์

### Q: ต้องการสิทธิ์เพิ่ม?

**A:** ติดต่อ Admin เพื่อขอปรับ role

### Q: Export ข้อมูลได้ไหม?

**A:** ได้ ใช้ปุ่ม Export CSV ในหน้า Work Packages หรือสร้าง Reports แล้ว export

### Q: ใช้บนมือถือได้ไหม?

**A:** ได้ ระบบรองรับการใช้งานบน mobile browsers

### Q: Session หมดอายุเร็วไป?

**A:** Access token หมดอายุใน 30 นาที แต่ระบบจะ auto-refresh อัตโนมัติ ถ้า inactive นาน refresh token จะหมดอายุ (7 วัน) และต้อง login ใหม่

---

## Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:

**IT Support Team**  
Digital Medical Infrastructure Team  
Medical Center, Walailak University

📧 Email: [email protected]  
📞 Phone: 075-xxx-xxx  
🕐 Working Hours: Monday-Friday 8:30-16:30

---

## Appendix

### สถานะ (Status) ต่างๆ

| Status | คำอธิบาย | สี |
|--------|----------|-----|
| New | งานใหม่ที่ยังไม่เริ่มทำ | 🔵 Blue |
| In Progress | กำลังดำเนินการ | 🟡 Yellow |
| On Hold | ระงับไว้ชั่วคราว | 🟠 Orange |
| Completed | เสร็จสมบูรณ์ | 🟢 Green |
| Closed | ปิดแล้ว | ⚫ Gray |

### Priority Levels

| Priority | คำอธิบาย | สี |
|----------|----------|-----|
| Urgent | เร่งด่วนมาก | 🔴 Red |
| High | สูง | 🟠 Orange |
| Normal | ปกติ | 🟡 Yellow |
| Low | ต่ำ | 🟢 Green |

### Work Package Types

| Type | คำอธิบาย |
|------|----------|
| Task | งานทั่วไป |
| Bug | ข้อผิดพลาด/ปัญหา |
| Feature | คุณสมบัติใหม่ |
| Support | งานสนับสนุน |
| Maintenance | งานบำรุงรักษา |

---

**เวอร์ชัน:** 1.0.0  
**อัปเดตล่าสุด:** October 2025
