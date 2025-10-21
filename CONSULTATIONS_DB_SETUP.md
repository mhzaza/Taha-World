# Consultations Database Setup & Testing Guide

## ✅ What Was Updated

The consultations page now **fetches real consultations from the database** instead of using static data!

### Updated File:
- ✅ `client/src/app/consultations/page.tsx` - Now uses `consultationsAPI.getAll()`

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Seed the Database

Make sure your server is running, then run the seed script:

```bash
cd server
node src/scripts/seedConsultations.js
```

You should see:
```
✅ Connected to MongoDB
🗑️  Deleted X existing consultations
✅ Successfully seeded 7 consultations

1. الاستشارة الرياضية التأسيسية: بطل مصارعة الذراعين
   - Category: sports
   - Price: 100 USD
   - Duration: 75 دقيقة
   - Type: both
...
✨ Consultation seeding completed successfully!
```

### Step 2: Start Your Server (if not running)

```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend  
cd client
npm run dev
```

### Step 3: Test the Page

Visit: `http://localhost:3000/consultations`

---

## 🎯 What You'll See

### Loading State
When the page loads, you'll see:
```
🔄 جاري تحميل الاستشارات...
```

### Success State (After Loading)
The page will display **7 real consultations from your database**:

1. **الاستشارة الرياضية التأسيسية: بطل مصارعة الذراعين**
   - Price: 100$
   - Duration: 75 دقيقة
   - Category: sports

2. **استشارة التحضير للمنافسات والبطولات**
   - Price: 75$
   - Duration: 90 دقيقة
   - Category: sports

3. **الاستشارة الجماعية للفرق والمؤسسات**
   - Price: 100$
   - Duration: 120 دقيقة
   - Category: group

4. **استشارة "بوصلة الحياة وتحديد الأهداف"**
   - Price: 50$
   - Duration: 60 دقيقة
   - Category: life_coaching

5. **استشارة "توازن العمل والحياة"**
   - Price: 50$
   - Duration: 60 دقيقة
   - Category: life_coaching

6. **استشارة "مهارات التواصل والتأثير في العلاقات"**
   - Price: 50$
   - Duration: 60 دقيقة
   - Category: life_coaching

7. **استشارة "المسار الحصري والتحولات النوعية" (VIP)**
   - Price: 150$
   - Duration: 90 دقيقة
   - Category: vip
   - With ⭐ VIP badge!

### Category Filtering
Click on category buttons to filter:
- 📋 جميع الاستشارات (All)
- 🏋️‍♂️ الاستشارات الرياضية (Sports)
- 🎯 الاستشارات الحياتية (Life Coaching)
- 👥 الاستشارات الجماعية (Group)
- ⭐ الاستشارات الحصرية (VIP)

### Error State
If database is not connected or seeded:
```
❌ فشل في تحميل الاستشارات
[إعادة المحاولة] button
```

### Empty State
If no consultations match the selected category:
```
لا توجد استشارات في هذه الفئة
[عرض جميع الاستشارات] link
```

---

## 🎨 New Features

### 1. **Loading State**
- Shows spinner while fetching from database
- Better UX

### 2. **Error Handling**
- If API call fails, shows error message in Arabic
- "إعادة المحاولة" button to retry
- Toast notification on error

### 3. **Empty States**
- Shows helpful message if no consultations
- Option to view all categories

### 4. **VIP Badge**
- VIP consultations show a special ⭐ VIP badge
- Yellow highlight to stand out

### 5. **Line Clamping**
- Long descriptions are truncated with `line-clamp-3`
- Features list shows first 3, then "+ X ميزة أخرى"
- Cleaner, more consistent card heights

### 6. **Real MongoDB IDs**
- Book buttons now use `consultation._id` (MongoDB ID)
- Works with the booking page correctly

---

## 🔧 Troubleshooting

### Problem: "لا توجد استشارات متاحة حالياً"

**Solution**: Database not seeded. Run:
```bash
cd server
node src/scripts/seedConsultations.js
```

### Problem: "فشل في تحميل الاستشارات"

**Possible causes**:
1. Backend server not running → Start: `cd server && npm start`
2. Database not connected → Check MongoDB connection
3. CORS issues → Check `server/.env` has correct `CLIENT_URL`

**Check server logs** for detailed error messages.

### Problem: Booking page shows error

**Solution**: Make sure you seeded consultations first. The booking page needs valid MongoDB `_id` values.

---

## 🧪 Testing the Complete Flow

### 1. View Consultations
```
Visit: http://localhost:3000/consultations
✓ Should see 7 consultations from database
```

### 2. Filter by Category
```
Click: 🏋️‍♂️ الاستشارات الرياضية
✓ Should see only 2 sports consultations
```

### 3. Book a Consultation
```
Click: "احجز الآن" on any consultation
✓ Redirects to /consultations/book?type=MONGODB_ID
✓ Opens booking modal
✓ Shows user info auto-filled
```

### 4. Test API Directly
```bash
# Get all consultations
curl http://localhost:5000/api/consultations

# Get sports consultations only
curl http://localhost:5000/api/consultations?category=sports

# Get specific consultation
curl http://localhost:5000/api/consultations/CONSULTATION_ID
```

---

## 📊 API Response Example

When page loads, it calls:
```
GET http://localhost:5000/api/consultations
```

Expected response:
```json
{
  "success": true,
  "consultations": [
    {
      "_id": "67123abc456def789",
      "consultationId": 1,
      "title": "الاستشارة الرياضية التأسيسية: بطل مصارعة الذراعين",
      "description": "استشارة متخصصة للراغبين بدخول...",
      "duration": "75 دقيقة",
      "durationMinutes": 75,
      "price": 100,
      "currency": "USD",
      "category": "sports",
      "features": ["...", "...", "..."],
      "consultationType": "both",
      "isActive": true,
      "displayOrder": 1,
      "createdAt": "2025-10-21T...",
      "updatedAt": "2025-10-21T..."
    },
    // ... 6 more consultations
  ],
  "count": 7
}
```

---

## ✅ Verification Checklist

- [ ] Seeded database with 7 consultations
- [ ] Server running on port 5000
- [ ] Client running on port 3000
- [ ] Visited /consultations page
- [ ] Saw loading spinner initially
- [ ] Saw 7 consultations appear
- [ ] Tried filtering by category
- [ ] Clicked "احجز الآن" and booking page opened
- [ ] Saw correct consultation details in booking modal
- [ ] No console errors

---

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ Page shows "جاري تحميل الاستشارات..." briefly
2. ✅ 7 consultations appear from database
3. ✅ Each has real price, duration, features
4. ✅ Category filtering works
5. ✅ VIP consultation has yellow badge
6. ✅ "احجز الآن" links to correct MongoDB ID
7. ✅ No "static data" or hardcoded IDs

---

## 🔄 How It Works

```
Page loads
    ↓
useEffect() runs
    ↓
Calls loadConsultations()
    ↓
Shows loading spinner
    ↓
Fetches from: GET /api/consultations
    ↓
Backend queries MongoDB
    ↓
Returns consultations where isActive: true
    ↓
Frontend sets consultations state
    ↓
Renders consultation cards
    ↓
User sees real data from database ✅
```

---

## 📝 Code Changes Summary

### Before:
```tsx
// Static data
import { consultationTypes } from '@/data/consultations'

const filteredConsultations = consultationTypes.filter(...)
```

### After:
```tsx
// Dynamic data from database
import { consultationsAPI } from '@/lib/api'

const [consultations, setConsultations] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const response = await consultationsAPI.getAll()
  setConsultations(response.data.consultations)
}, [])
```

---

**The consultations page now displays real data from your database!** 🎉

Run the seed script and refresh the page to see 7 consultations loaded from MongoDB.

