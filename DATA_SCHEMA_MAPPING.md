# 📊 WorkSLA Data Schema & Mapping Documentation

## 🎯 ข้อมูลจาก work_improved.py Analysis

### Work Package Structure (จาก OpenProject API v3)

```typescript
interface WorkPackage {
  // Basic Info
  id: number;                    // 34909
  subject: string;               // "ขอช่วยจัดหาสเปคชุดคอมพิวเตอร์..."
  description?: string;          // HTML content (ต้อง sanitize)
  
  // Status & Classification
  status: string;                // "ดำเนินการเสร็จ" | "New" | "รับเรื่อง" | "กำลังดำเนินการ"
  type: string;                  // "ปัญหาฮาร์ดแวร์"
  priority: string;              // "Normal" | "High" | "Low"
  category: string;              // "Task"
  
  // People
  assignee: {
    name: string;                // "Apirak Jaisue"
    href: string;                // API link to user
  };
  author: {
    name: string;                // "ผู้แจ้งงาน e-service"
    href: string;
  };
  
  // Dates (ISO 8601 format)
  createdAt: string;             // "2025-10-02T10:16:00Z"
  updatedAt: string;             // "2025-10-10T08:21:00Z"
  startDate?: string;            // "2025-10-02"
  dueDate?: string;              // "2025-10-14"
  
  // Project
  project: {
    name: string;                // "ระบบแจ้งซ่อม สารสนเทศ"
    href: string;
  };
  
  // Custom Fields (key-value pairs)
  customFields: {
    location: string;            // "C|1|ห้อง Mammography"
    contact: string;             // "ศศิประภา โป๋ชัน|79446"
    urgency: string;             // "ด่วน"
    workType: string;            // "คอมพิวเตอร์ตั้งโต๊ะ / จอภาพ/เมาส์/ คีย์บอร์ด"
    startDate: string;           // "2025-10-14 09:00"
    endDate: string;             // "2025-10-02"
  };
}
```

### Activity Structure (Timeline/History)

```typescript
interface Activity {
  id: number;                    // Activity unique ID
  index: number;                 // ลำดับ (1, 2, 3, 4)
  
  // User & Time
  user: {
    name: string;                // "Apirak Jaisue"
    href: string;
  };
  createdAt: string;             // ISO 8601: "2025-10-02T10:16:00Z"
  
  // Content
  comment?: string;              // "front" | "กำลังดำเนินการ" | "ส่งให้ทางไลน์เรียบร้อยแล้วครับ"
  
  // Changes (FieldChange[])
  changes: FieldChange[];
}

interface FieldChange {
  field: string;                 // "Status" | "Assignee" | "Type" | "Priority" | etc.
  oldValue?: string;             // "New" | null
  newValue?: string;             // "รับเรื่อง"
  action: string;                // "set" | "changed"
}
```

### Example Activity Timeline (4 Activities)

```json
[
  {
    "id": 1,
    "user": "ผู้แจ้งงาน e-service",
    "createdAt": "2025-10-02T10:16:00Z",
    "comment": null,
    "changes": [
      {"field": "Type", "action": "set", "newValue": "ปัญหาฮาร์ดแวร์"},
      {"field": "Status", "action": "set", "newValue": "New"},
      {"field": "Priority", "action": "set", "newValue": "Normal"},
      {"field": "Subject", "action": "set", "newValue": "ขอช่วยจัดหา..."}
    ]
  },
  {
    "id": 2, 
    "user": "Apirak Jaisue",
    "createdAt": "2025-10-02T10:38:00Z",
    "comment": "front",
    "changes": [
      {"field": "Status", "action": "changed", "oldValue": "New", "newValue": "รับเรื่อง"},
      {"field": "Assignee", "action": "set", "newValue": "Apirak Jaisue"},
      {"field": "Category", "action": "set", "newValue": "Task"}
    ]
  },
  {
    "id": 3,
    "user": "Apirak Jaisue", 
    "createdAt": "2025-10-10T08:18:00Z",
    "comment": "กำลังดำเนินการ",
    "changes": [
      {"field": "Status", "action": "changed", "oldValue": "รับเรื่อง", "newValue": "กำลังดำเนินการ"}
    ]
  },
  {
    "id": 4,
    "user": "Apirak Jaisue",
    "createdAt": "2025-10-10T08:21:00Z", 
    "comment": "ส่งให้ทางไลน์เรียบร้อยแล้วครับ",
    "changes": [
      {"field": "Status", "action": "changed", "oldValue": "กำลังดำเนินการ", "newValue": "ดำเนินการเสร็จ"}
    ]
  }
]
```

## 🎨 UI Requirements

### Status Colors
```typescript
const STATUS_COLORS = {
  "New": "#2196F3",              // Blue
  "รับเรื่อง": "#FF9800",        // Orange  
  "กำลังดำเนินการ": "#FFC107",  // Amber
  "ดำเนินการเสร็จ": "#4CAF50",  // Green
  "ปิดงาน": "#9E9E9E"           // Gray
};
```

### Priority Colors
```typescript
const PRIORITY_COLORS = {
  "High": "#F44336",             // Red
  "Normal": "#FF9800",           // Orange
  "Low": "#4CAF50"               // Green
};
```

### HTML Sanitization Required
- Activity comments อาจมี HTML tags
- Description field มี HTML content
- ต้องใช้ DOMPurify หรือ strip HTML tags
- แสดงเฉพาะ plain text ใน UI

### Date Formatting
- API ส่งมาเป็น ISO 8601: "2025-10-02T10:16:00Z"
- แสดงในรูปแบบไทย: "2 ต.ค. 2568 10:16 น."
- Timezone: Asia/Bangkok

### Custom Fields Mapping
```typescript
const CUSTOM_FIELD_LABELS = {
  location: "📍 สถานที่",
  contact: "📞 ผู้แจ้ง",
  urgency: "⚡ ความเร่งด่วน", 
  workType: "💻 ประเภทงาน",
  startDate: "📅 วันที่เริ่มต้น",
  endDate: "📅 วันที่สิ้นสุด"
};
```

## 🔌 API Endpoints ที่ต้องใช้

### Current Backend APIs (ตรวจสอบใน /worksla/api/)
1. `GET /api/workpackages/` - List work packages
2. `GET /api/workpackages/{id}` - Get work package detail
3. `GET /api/workpackages/{id}/activities` - Get activities (ถ้ามี)

### ข้อมูลที่ UI ต้องการ
- **List Page:** id, subject, status, assignee, priority, createdAt, updatedAt
- **Detail Page:** ข้อมูลครบถ้วน + activities + custom fields
- **Timeline:** activities sorted by createdAt with status changes

## ✅ Implementation Checklist

### Data Processing
- [ ] Parse ISO dates to Thai format
- [ ] Sanitize HTML in comments/description  
- [ ] Map status/priority to colors
- [ ] Handle null/undefined values safely
- [ ] Cache user data for performance

### UI Components Needed
- [ ] StatusChip component (colored badge)
- [ ] ActivityTimeline component
- [ ] CustomFieldsDisplay component
- [ ] DateFormatter utility
- [ ] HTMLSanitizer utility

### Responsive Design
- [ ] Mobile: Stack cards vertically
- [ ] Tablet: 2-column layout
- [ ] Desktop: Full table + sidebar
- [ ] Timeline: Vertical on mobile, horizontal on desktop

### Error Handling
- [ ] Loading states (skeleton)
- [ ] Empty states (no data)
- [ ] Error states (API failure)
- [ ] Fallback values for missing data