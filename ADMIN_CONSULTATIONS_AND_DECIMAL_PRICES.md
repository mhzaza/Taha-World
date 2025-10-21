# Admin Consultations Management & Decimal Prices Implementation

## تاريخ التحديث
21 أكتوبر 2025

## ملخص التحديثات

تم تنفيذ مجموعة من التحديثات الرئيسية لتحسين نظام الاستشارات وإدارة الأسعار:

### 1. إضافة الاستشارات إلى لوحة تحكم الأدمن

#### التحديثات على Frontend:

**أ. Admin Dashboard (`client/src/app/admin/page.tsx`)**
- تمت إضافة زر جديد "إدارة الاستشارات" في قسم الإجراءات السريعة (Quick Actions)
- رابط مباشر إلى: `/admin/consultations`
- أيقونة: `ClockIcon`
- لون: Indigo (`bg-indigo-500`)

**ب. صفحة إدارة الاستشارات (`client/src/app/admin/consultations/page.tsx`)**
- صفحة شاملة لعرض وإدارة جميع حجوزات الاستشارات
- **إحصائيات في الوقت الفعلي:**
  - إجمالي الحجوزات
  - في انتظار التأكيد
  - مؤكدة
  - مكتملة
  - إجمالي الإيرادات
- **مرشحات وبحث:**
  - بحث بالاسم، البريد، أو رقم الحجز
  - تصفية حسب الحالة (pending, confirmed, completed, cancelled)
- **جدول الحجوزات:**
  - عرض تفاصيل كل حجز
  - معلومات العميل
  - نوع الاستشارة
  - التاريخ والوقت
  - المبلغ والحالة
  - إجراءات (عرض، تأكيد، إلغاء)
- **زر إضافة استشارة جديدة**

**ج. صفحة إضافة استشارة جديدة (`client/src/app/admin/consultations/new/page.tsx`)**
- نموذج شامل لإنشاء استشارات جديدة
- **الأقسام:**
  1. **المعلومات الأساسية:**
     - رقم الاستشارة (Consultation ID)
     - العنوان (عربي وإنجليزي)
     - الوصف (عربي وإنجليزي)
  2. **المدة:**
     - المدة (نص، مثل: "60 دقيقة")
     - المدة بالدقائق (15-480 دقيقة)
  3. **التسعير:**
     - السعر الحالي (يدعم الأرقام العشرية)
     - السعر الأصلي (اختياري)
     - العملة (USD, SAR, EGP)
  4. **التصنيف والنوع:**
     - الفئة (sports, life_coaching, nutrition, group, vip, general)
     - نوع الاستشارة (online, in_person, both)
  5. **المميزات:**
     - إضافة وإزالة المميزات ديناميكيًا
  6. **إعدادات إضافية:**
     - الحد الأقصى للحجوزات اليومية
     - حالة التفعيل (Active/Inactive)

#### التحديثات على Backend:

**أ. Consultation Routes (`server/src/routes/consultations.js`)**

تمت إضافة 3 endpoints جديدة:

1. **`GET /api/consultations/admin/bookings`** - جلب جميع الحجوزات (للأدمن)
   - معايير الفلترة: status, page, limit
   - تشمل بيانات المستخدم والاستشارة والطلب
   - Pagination support

2. **`PUT /api/consultations/admin/booking/:bookingId/confirm`** - تأكيد الحجز
   - تحديد التاريخ والوقت النهائي
   - إضافة ملاحظات إدارية

3. **`POST /api/consultations/admin/create`** - إنشاء استشارة جديدة
   - التحقق من صحة جميع البيانات
   - التحقق من عدم تكرار consultationId
   - يدعم الأسعار العشرية

4. **`PUT /api/consultations/admin/:consultationId`** - تحديث استشارة
   - تحديث أي حقل من حقول الاستشارة
   - التحقق من صحة البيانات

---

### 2. دعم الأسعار العشرية (Float/Decimal Prices)

تم تحديث جميع الموديلات والنماذج لقبول أسعار بقيم عشرية (مثل: 99.99 بدلاً من 100 فقط).

#### التحديثات على Database Models:

**أ. Consultation Model (`server/src/models/Consultation.js`)**
```javascript
price: {
  type: Number,
  required: [true, 'Price is required'],
  min: [0, 'Price cannot be negative'],
  validate: {
    validator: function(value) {
      return Number.isFinite(value) && /^\d+(\.\d{1,2})?$/.test(value.toFixed(2));
    },
    message: 'Price must be a valid number with up to 2 decimal places'
  }
},
originalPrice: {
  type: Number,
  min: [0, 'Original price cannot be negative'],
  validate: {
    validator: function(value) {
      if (value === null || value === undefined) return true;
      return Number.isFinite(value) && /^\d+(\.\d{1,2})?$/.test(value.toFixed(2));
    },
    message: 'Original price must be a valid number with up to 2 decimal places'
  }
}
```

**ب. Course Model (`server/src/models/Course.js`)**
```javascript
price: {
  type: Number,
  required: [true, 'Course price is required'],
  min: [0, 'Price cannot be negative'],
  validate: {
    validator: function(value) {
      return Number.isFinite(value) && /^\d+(\.\d{1,2})?$/.test(value.toFixed(2));
    },
    message: 'Price must be a valid number with up to 2 decimal places'
  }
}
```

**ج. ConsultationBooking Model (`server/src/models/ConsultationBooking.js`)**
```javascript
amount: {
  type: Number,
  required: [true, 'Amount is required'],
  min: [0, 'Amount cannot be negative'],
  validate: {
    validator: function(value) {
      return Number.isFinite(value) && /^\d+(\.\d{1,2})?$/.test(value.toFixed(2));
    },
    message: 'Amount must be a valid number with up to 2 decimal places'
  }
}
```

**د. Order Model (`server/src/models/Order.js`)**
```javascript
amount: {
  type: Number,
  required: [true, 'Order amount is required'],
  min: [0, 'Amount cannot be negative'],
  validate: {
    validator: function(value) {
      return Number.isFinite(value) && /^\d+(\.\d{1,2})?$/.test(value.toFixed(2));
    },
    message: 'Amount must be a valid number with up to 2 decimal places'
  }
}
```

#### التحديثات على Frontend Forms:

**أ. Course Form (`client/src/components/admin/CourseForm.tsx`)**
- تحديث input السعر الحالي:
  ```tsx
  <input
    type="number"
    step="0.01"
    placeholder="0.00"
    min="0"
  />
  ```
- تحديث input السعر الأصلي بنفس الطريقة

**ب. Consultation Form (`client/src/app/admin/consultations/new/page.tsx`)**
- جميع حقول الأسعار تدعم القيم العشرية:
  ```tsx
  <input
    type="number"
    step="0.01"
    placeholder="0.00"
    min="0"
  />
  ```

---

## الميزات الجديدة

### 1. إدارة شاملة للاستشارات
- ✅ عرض جميع حجوزات الاستشارات
- ✅ إحصائيات في الوقت الفعلي
- ✅ بحث وفلترة متقدمة
- ✅ إنشاء استشارات جديدة
- ✅ تأكيد وإدارة الحجوزات

### 2. مرونة في التسعير
- ✅ دعم الأسعار العشرية (حتى منزلتين)
- ✅ التحقق من صحة الأسعار
- ✅ دعم عملات متعددة (USD, SAR, EGP)
- ✅ إمكانية تحديد سعر أصلي للعروض

---

## API Endpoints الجديدة

### Consultations Management

#### 1. Get All Bookings (Admin)
```
GET /api/consultations/admin/bookings
```
**Query Parameters:**
- `status`: Filter by booking status
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "bookings": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 2,
    "limit": 50
  }
}
```

#### 2. Confirm Booking
```
PUT /api/consultations/admin/booking/:bookingId/confirm
```
**Body:**
```json
{
  "confirmedDate": "2025-10-25",
  "confirmedTime": "14:30",
  "notes": "Optional admin notes"
}
```

#### 3. Create Consultation
```
POST /api/consultations/admin/create
```
**Body:**
```json
{
  "consultationId": 8,
  "title": "استشارة جديدة",
  "description": "وصف الاستشارة",
  "duration": "60 دقيقة",
  "durationMinutes": 60,
  "price": 99.99,
  "currency": "USD",
  "category": "sports",
  "consultationType": "both",
  "features": ["ميزة 1", "ميزة 2"]
}
```

#### 4. Update Consultation
```
PUT /api/consultations/admin/:consultationId
```
**Body:** (all fields optional)
```json
{
  "title": "عنوان محدث",
  "price": 149.99,
  "isActive": true
}
```

---

## Routes Structure

```
/admin/consultations
├── /admin/consultations          # قائمة جميع الحجوزات
└── /admin/consultations/new       # إضافة استشارة جديدة
```

---

## Testing Instructions

### 1. اختبار صفحة إدارة الاستشارات:
```bash
# تسجيل الدخول كأدمن
# ثم الذهاب إلى:
http://localhost:3000/admin/consultations
```

### 2. اختبار إضافة استشارة جديدة:
```bash
# من صفحة إدارة الاستشارات
# اضغط على "إضافة استشارة جديدة"
# أو مباشرة:
http://localhost:3000/admin/consultations/new
```

### 3. اختبار الأسعار العشرية:
```bash
# في أي نموذج (دورة أو استشارة)
# جرب إدخال: 99.99, 149.50, 1299.95
# يجب أن يقبل النظام القيم العشرية
```

---

## Notes & Limitations

1. **الأسعار العشرية:**
   - الحد الأقصى: منزلتين عشريتين
   - أمثلة صحيحة: 99.99, 100.00, 1499.95
   - أمثلة خاطئة: 99.999, 100.9999

2. **صلاحيات الأدمن:**
   - جميع endpoints الجديدة تتطلب صلاحيات admin
   - يتم التحقق من `req.user.isAdmin`

3. **Validation:**
   - جميع البيانات تمر عبر `express-validator`
   - رسائل خطأ بالعربية والإنجليزية

---

## Future Enhancements (مقترحات)

1. ✨ إضافة صفحة تعديل الاستشارات الموجودة
2. ✨ إضافة رفع صور للاستشارات
3. ✨ إشعارات للأدمن عند حجز جديد
4. ✨ تقارير تفصيلية عن الاستشارات
5. ✨ إدارة جدول الاستشارات (Calendar View)

---

## المطورون
تم التطوير بواسطة AI Assistant - Claude Sonnet 4.5
تاريخ: 21 أكتوبر 2025

