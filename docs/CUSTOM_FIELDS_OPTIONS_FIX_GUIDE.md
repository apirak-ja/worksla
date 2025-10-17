# 🔧 Custom Fields & Custom Options Display Fix

**Issue:** Custom Fields และ Custom Options ไม่แสดงในหน้า Detail  
**Root Cause:** Frontend ไม่ได้เรียกใช้ข้อมูลที่ backend ส่งมาอย่างถูกต้อง

---

## 📊 ข้อมูลที่ Backend ส่งมา

Backend ได้ปรับปรุงให้ส่งข้อมูล Custom Fields แบบเต็มรูปแบบแล้ว:

### **Structure ของ Work Package Response:**
```javascript
{
  "wp_id": 34909,
  "subject": "ขอช่วยจัดหาสเปค...",
  "status": "ดำเนินการเสร็จ",
  
  // Custom Fields (direct values)
  "customField2": "ค่าจาก field 2",
  "customField3": "ค่าจาก field 3",
  "customField5": "C|1|ห้อง Mammography",
  "customField7": "ศศิประภา โป๋ชัน|79446",
  "customField8": "ศศิประภา โป๋ชัน",
  "customField9": "ด่วน",
  "customField10": "2025-10-14T09:00:00Z",
  "customField25": "2025-10-02",
  
  // Custom Options (option values)
  "customField3_option_value": "คอมพิวเตอร์ตั้งโต๊ะ / จอภาพ/เมาส์/ คีย์บอร์ด",
  "customField3_option_id": 42,
  "customField9_option_value": "ด่วน",
  "customField9_option_id": 33,
  
  // Full details
  "custom_fields_detail": {
    "customField3": {
      "label": "ประเภทงานย่อย Hardware",
      "value": "ค่าปกติ",
      "option_value": "คอมพิวเตอร์ตั้งโต๊ะ / จอภาพ/เมาส์/ คีย์บอร์ด",
      "option_id": 42
    },
    ...
  }
}
```

---

## 🎯 แนวทางแก้ไขใน Frontend

### **ปัญหาปัจจุบัน:**
```typescript
// ใน WorkPackageDetailModern.tsx
// Extract custom fields
const customFields: Record<string, any> = {};
Object.keys(wp).forEach((key) => {
  if (key.startsWith('customField')) {
    customFields[key] = wp[key];  // ✅ ได้ custom field values
  }
});
```

**❌ ปัญหา:** ไม่ได้ดึง `customFieldX_option_value` ที่เป็นค่า Custom Options

---

## ✅ วิธีแก้ไข

### **1. แยก Custom Fields และ Custom Options**

```typescript
// Extract custom fields AND custom options
const customFields: Record<string, any> = {};
const customOptions: Record<string, any> = {};

Object.keys(wp).forEach((key) => {
  if (key.startsWith('customField')) {
    if (key.includes('_option_value')) {
      // This is a custom option value
      const baseKey = key.replace('_option_value', '');
      customOptions[baseKey] = wp[key];
    } else if (!key.includes('_option_id') && !key.includes('_detail')) {
      // Regular custom field value
      customFields[key] = wp[key];
    }
  }
});
```

### **2. แสดง Custom Options แยกต่างหาก**

```typescript
{/* Custom Options - Special Display */}
<Zoom in timeout={450}>
  <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
          <Settings />
        </Avatar>
        <Typography variant="h6" fontWeight={700}>
          ⚙️ ตัวเลือกพิเศษ
        </Typography>
      </Stack>
      
      <Grid container spacing={3}>
        {/* Hardware Type - customField3 */}
        {customOptions.customField3 && (
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Computer />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800}>
                      💻 ประเภทงานย่อย Hardware
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      หมวดหมู่อุปกรณ์
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={customOptions.customField3}
                  sx={{
                    bgcolor: alpha('#E91E63', 0.1),
                    color: '#E91E63',
                    fontWeight: 700,
                    height: 36,
                  }}
                />
              </Stack>
            </Paper>
          </Grid>
        )}

        {/* Urgency - customField9 */}
        {customOptions.customField9 && (
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <PriorityHigh />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800}>
                      ⚡ ความเร่งด่วน
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ระดับความสำคัญ
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={customOptions.customField9}
                  sx={{
                    bgcolor: alpha('#FF5722', 0.1),
                    color: '#FF5722',
                    fontWeight: 700,
                    height: 36,
                  }}
                />
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>
    </CardContent>
  </Card>
</Zoom>
```

---

## 🔍 การตรวจสอบข้อมูล

### **เพิ่ม Console Log เพื่อ Debug:**

```typescript
useEffect(() => {
  if (wpDetail) {
    console.log('=== Work Package Data ===');
    console.log('All Keys:', Object.keys(wpDetail));
    
    console.log('\n=== Custom Fields ===');
    Object.keys(wpDetail)
      .filter(k => k.startsWith('customField') && !k.includes('_option'))
      .forEach(k => console.log(`${k}: ${wpDetail[k]}`));
    
    console.log('\n=== Custom Options ===');
    Object.keys(wpDetail)
      .filter(k => k.includes('_option_value'))
      .forEach(k => console.log(`${k}: ${wpDetail[k]}`));
    
    console.log('\n=== Custom Fields Detail ===');
    console.log(wpDetail.custom_fields_detail);
  }
}, [wpDetail]);
```

---

## 📝 Field Mapping Reference

| Field Key | Label | Type | Example Value |
|-----------|-------|------|---------------|
| `customField2` | ประเภทงานย่อย Network | Option | title from _links |
| `customField3` | ประเภทงานย่อย Hardware | Option | title from _links |
| `customField3_option_value` | - | Option Value | "คอมพิวเตอร์ตั้งโต๊ะ / จอภาพ/เมาส์/ คีย์บอร์ด" |
| `customField5` | สถานที่ | Text | "C\|1\|ห้อง Mammography" |
| `customField6` | หน่วยงานที่ตั้ง | Text | - |
| `customField7` | ผู้แจ้ง (เบอร์โทร) | Text | "ศศิประภา โป๋ชัน\|79446" |
| `customField8` | แจ้งโดย | Text | "ศศิประภา โป๋ชัน" |
| `customField9` | ความเร่งด่วน | Option | title from _links |
| `customField9_option_value` | - | Option Value | "ด่วน" |
| `customField10` | วันที่เริ่มต้น | Date | "2025-10-14T09:00:00Z" |
| `customField23` | วันที่รับงาน | Date | - |
| `customField25` | วันที่สิ้นสุด | Date | "2025-10-02" |

---

## 🚀 Implementation Steps

### **Step 1: อัปเดต Custom Fields Extraction**
แก้ไขใน `WorkPackageDetailModern.tsx` บรรทัด ~175:

```typescript
const customFields: Record<string, any> = {};
const customOptions: Record<string, any> = {};

Object.keys(wp).forEach((key) => {
  if (key.startsWith('customField')) {
    if (key.endsWith('_option_value')) {
      const baseKey = key.replace('_option_value', '');
      customOptions[baseKey] = wp[key];
    } else if (!key.includes('_option_id') && !key.includes('_detail')) {
      customFields[key] = wp[key];
    }
  }
});
```

### **Step 2: เพิ่ม Custom Options Section**
เพิ่มหลังจาก Custom Fields Display (หลังบรรทัด ~540):

```typescript
{/* Custom Options Section */}
{(customOptions.customField3 || customOptions.customField9) && (
  <Zoom in timeout={450}>
    <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
      {/* ... implementation above ... */}
    </Card>
  </Zoom>
)}
```

### **Step 3: Test และ Verify**
1. Restart frontend container
2. เปิด DevTools Console
3. ดูข้อมูลที่ log ออกมา
4. ตรวจสอบว่า Custom Options แสดงถูกต้อง

---

## 🎯 Expected Result

เมื่อเปิด Work Package #34909:

### **🏷️ ข้อมูลเพิ่มเติม (Custom Fields)**
- ✅ สถานที่: "ห้อง Mammography" + chip "C|1"
- ✅ ผู้แจ้ง (เบอร์โทร): "ศศิประภา โป๋ชัน" + chip "โทร: 79446"
- ✅ แจ้งโดย: "ศศิประภา โป๋ชัน"
- ✅ วันที่เริ่มต้น: "14 ตุลาคม 2025 09:00 น."
- ✅ วันที่สิ้นสุด: "2 ตุลาคม 2025"

### **⚙️ ตัวเลือกพิเศษ (Custom Options)**
- ✅ 💻 ประเภทงานย่อย Hardware: "คอมพิวเตอร์ตั้งโต๊ะ / จอภาพ/เมาส์/ คีย์บอร์ด"
- ✅ ⚡ ความเร่งด่วน: "ด่วน"

---

## 🐛 Troubleshooting

### **Q: Custom Options ยังไม่แสดง?**
**A:** ตรวจสอบ Console Log ว่ามีค่า `customFieldX_option_value` หรือไม่

### **Q: Backend ยัง error 404 custom_options?**
**A:** ตรวจสอบ backend logs และรอให้ restart เสร็จสมบูรณ์ (~10 วินาที)

### **Q: ข้อมูลครบแต่ไม่แสดง?**
**A:** ตรวจสอบ condition `{customOptions.customField3 && (...)}` ใน JSX

---

**Status:** Backend แก้ไขเรียบร้อย, รอ Frontend implementation  
**Next:** ให้ Frontend ทีมแก้ไขตาม steps ข้างต้น