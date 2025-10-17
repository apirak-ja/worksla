# คู่มือการใช้งานสคริปต์ `work_improved.py`

คู่มือนี้อธิบายการตั้งค่าและการใช้งานสคริปต์ `work_improved.py` สำหรับดึงข้อมูล Work Package จากระบบ OpenProject รวมถึงแนวทางการนำข้อมูลกิจกรรม (Activities) ไปใช้งานต่อบนหน้า Work Package Detail

## 1. สิ่งที่ต้องเตรียม

- Python 3.10 ขึ้นไป พร้อม Poetry/venv (โปรเจกต์นี้ใช้ virtualenv ที่ `.venv`)
- ไฟล์ `.env` ในโฟลเดอร์รากของโปรเจกต์ ที่ประกอบด้วยคีย์ดังนี้

  ```bash
  OPENPROJECT_URL=https://<your-openproject-host>
  OPENPROJECT_API_KEY=<base64-basic-auth-token>
  WORK_PACKAGE_ID=<work-package-id>
  ```

  > หมายเหตุ: ค่า API Key เป็นสตริง Basic Auth ที่เข้ารหัส Base64 แล้ว (เช่น `base64(username:api-token)`)

## 2. การรันสคริปต์

1. เปิดเทอร์มินัลที่โฟลเดอร์ `/opt/code/openproject/worksla`
2. เปิดใช้งาน virtualenv (ถ้าไม่ได้เปิดอัตโนมัติ)

   ```bash
   source .venv/bin/activate
   ```

3. รันสคริปต์

   ```bash
   python work_improved.py
   ```

   หรือระบุ `WORK_PACKAGE_ID` เฉพาะได้ด้วย flag `--work-package-id`

   ```bash
   python work_improved.py --work-package-id 34909
   ```

4. หากต้องการเอาเฉพาะข้อมูลสรุปแบบย่อ ให้ใส่ flag `--quiet`

   ```bash
   python work_improved.py --quiet
   ```

เมื่อรันสำเร็จ สคริปต์จะเรียก OpenProject API และแสดงข้อมูลดังนี้

- ภาพรวม Work Package (Subject, Status, Priority, Assignee, วันที่สร้าง/อัปเดต)
- รายละเอียดหลัก รวมคำอธิบาย Custom Fields/Options
- ประวัติกิจกรรม (Activities) พร้อมรายละเอียดการเปลี่ยนแปลงแต่ละรายการ

## 3. โครงสร้างการทำงานที่เกี่ยวข้องกับ Activity

สคริปต์ใช้คลาส `OpenProjectClient` สำหรับสื่อสารกับ API โดยเมธ็อดที่เกี่ยวข้องกับกิจกรรมมีดังนี้

| เมธ็อด | หน้าที่ |
| --- | --- |
| `get_activities(work_package_id)` | เรียก `GET /api/v3/work_packages/{id}/activities` แล้วคืนลิสต์ของกิจกรรม |
| `get_user_name(user_link)` | ดึงชื่อผู้ใช้จากลิงก์ในแต่ละกิจกรรม (พร้อมแคช) |

ลิสต์กิจกรรมจะถูกส่งต่อให้ฟังก์ชัน `print_activities` เพื่อจัดรูปแบบข้อมูล โดยลูปแต่ละกิจกรรมและดึงรายละเอียดที่สำคัญ ได้แก่

- ชื่อผู้กระทำ (`user_name`)
- เวลาที่เกิดกิจกรรม (`createdAt`)
- ข้อความคอมเมนต์ (ถ้ามี)
- รายการเปลี่ยนแปลง (`details`)

> จุดสำคัญ: ในแต่ละกิจกรรม ไม่มีการคำนวณ "ระยะเวลาที่ผ่าน" ระหว่างกิจกรรม ตัวแอปฝั่ง Frontend จำเป็นต้องนำข้อมูล `createdAt` ของกิจกรรมมาคำนวณเองเพื่อแสดงช่วงเวลาระหว่างกิจกรรมที่ต่อเนื่องกัน

## 4. แนวทางประยุกต์ใช้บนหน้า Work Package Detail (Frontend)

1. ดึงข้อมูลกิจกรรมจากปลายทาง `/api/v3/work_packages/{id}/activities`
   - ในโปรเจกต์ Frontend มี service `wpApi.getJournals(id)` ที่เรียกข้อมูล Journals/Activities อยู่แล้ว
2. เรียงลำดับกิจกรรมจากใหม่ไปเก่า (หรือกลับกันตาม UX)
3. คำนวณระยะเวลาระหว่างกิจกรรมที่ต่อกัน โดยใช้เวลาของกิจกรรมปัจจุบันเทียบกับกิจกรรมก่อนหน้า เช่น

   ```ts
   import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns'

   const calculateDurationLabel = (current: Date, previous: Date) => {
     const minutes = differenceInMinutes(current, previous)
     if (minutes < 60) return `${minutes} นาที`
     const hours = differenceInHours(current, previous)
     if (hours < 24) return `${hours} ชม.`
     const days = differenceInDays(current, previous)
     return `${days} วัน`
   }
   ```

4. แสดงผลบนหน้า Work Package Detail ในส่วน "Activity Timeline" ให้ระบุทั้ง
   - ผู้กระทำ, ช่วงเวลา (relative time)
   - ระยะเวลาที่ผ่านตั้งแต่กิจกรรมก่อนหน้า (duration label)
5. ดูแลกรณีข้อมูลขาด/ผิดรูปแบบ (เช่น `created_at` ไม่มีค่า) เพื่อป้องกันการ crash

ด้วยแนวทางนี้ หน้า Work Package Detail จะมีข้อมูลกิจกรรมที่ครบถ้วนและเข้าใจง่าย สอดคล้องกับผลลัพธ์ที่สคริปต์ `work_improved.py` แสดงในฝั่ง CLI
