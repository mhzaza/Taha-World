# Consultation Booking Backend - Detailed Implementation Plan

## Overview
This document outlines the complete implementation plan for the consultation booking system. The system will allow users to book consultations, make payments, and manage their consultation appointments. Personal information (المعلومات الشخصية) will be automatically populated from the user database.

---

## 1. Database Models

### 1.1 Consultation Model (`server/src/models/Consultation.js`)

**Purpose**: Store consultation type definitions (like course catalog but for consultations)

```javascript
const consultationSchema = new mongoose.Schema({
  consultationId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  titleEn: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  descriptionEn: {
    type: String
  },
  duration: {
    type: String,  // e.g., "60 دقيقة"
    required: true
  },
  durationMinutes: {
    type: Number,  // Actual duration in minutes for scheduling
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'SAR', 'EGP'],
    default: 'USD'
  },
  category: {
    type: String,
    enum: ['sports', 'life_coaching', 'group', 'vip', 'nutrition'],
    required: true
  },
  features: [{
    type: String
  }],
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxBookingsPerDay: {
    type: Number,
    default: 5
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  consultationType: {
    type: String,
    enum: ['online', 'in_person', 'both'],
    default: 'both'
  }
}, {
  timestamps: true
});
```

### 1.2 ConsultationBooking Model (`server/src/models/ConsultationBooking.js`)

**Purpose**: Store individual consultation bookings with user information

```javascript
const consultationBookingSchema = new mongoose.Schema({
  // Booking Reference
  bookingNumber: {
    type: String,
    unique: true,
    required: true
    // Format: CB-YYYYMMDD-XXXX (CB = Consultation Booking)
  },
  
  // User Information (from User DB)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  userName: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true  // Required for consultations
  },
  
  // Consultation Details
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true,
    index: true
  },
  consultationType: {
    type: String,
    required: true
  },
  consultationTitle: {
    type: String,
    required: true
  },
  consultationCategory: {
    type: String,
    required: true
  },
  
  // Scheduling Information
  preferredDate: {
    type: Date,
    required: true,
    index: true
  },
  preferredTime: {
    type: String,
    required: true
    // Format: "HH:MM" (24-hour format)
  },
  alternativeDate: {
    type: Date
  },
  alternativeTime: {
    type: String
  },
  confirmedDateTime: {
    type: Date,
    index: true
  },
  timezone: {
    type: String,
    default: 'Asia/Riyadh'
  },
  duration: {
    type: Number,  // Duration in minutes
    required: true
  },
  
  // Meeting Details
  meetingType: {
    type: String,
    enum: ['online', 'in_person'],
    required: true
  },
  meetingLink: {
    type: String  // Zoom/Google Meet link (for online consultations)
  },
  meetingPassword: {
    type: String
  },
  location: {
    address: String,
    city: String,
    country: String,
    mapLink: String
  },
  
  // User's Specific Information for Consultation
  userDetails: {
    age: Number,
    gender: String,
    weight: Number,
    height: Number,
    fitnessLevel: String,
    medicalConditions: String,
    currentActivity: String,
    goals: [String],
    additionalNotes: String
  },
  
  // Payment Information
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['USD', 'SAR', 'EGP'],
    default: 'USD'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'stripe', 'bank_transfer', 'cash']
  },
  
  // Booking Status
  status: {
    type: String,
    enum: [
      'pending_payment',      // Waiting for payment
      'pending_confirmation', // Payment completed, waiting for admin confirmation
      'confirmed',            // Admin confirmed the booking
      'rescheduled',         // Booking was rescheduled
      'completed',           // Consultation completed
      'cancelled',           // Cancelled by user or admin
      'no_show'              // User didn't show up
    ],
    default: 'pending_payment',
    index: true
  },
  
  // Status Timestamps
  paymentCompletedAt: Date,
  confirmedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  
  // Cancellation/Rescheduling
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['user', 'admin', 'system']
  },
  rescheduledFrom: {
    date: Date,
    time: String
  },
  rescheduledReason: String,
  
  // Admin Notes and Actions
  adminNotes: String,
  assignedTo: {
    type: String,  // Coach/consultant name
    default: 'الكابتن طه الصباغ'
  },
  
  // Communication
  remindersSent: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'whatsapp']
    },
    sentAt: Date,
    purpose: String  // '24h_before', '1h_before', 'confirmation'
  }],
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpNotes: String,
  followUpDate: Date,
  
  // Review and Feedback
  userFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  source: {
    type: String,
    enum: ['web', 'mobile', 'admin'],
    default: 'web'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
consultationBookingSchema.index({ bookingNumber: 1 });
consultationBookingSchema.index({ userId: 1, status: 1 });
consultationBookingSchema.index({ preferredDate: 1, status: 1 });
consultationBookingSchema.index({ confirmedDateTime: 1 });
consultationBookingSchema.index({ createdAt: -1 });
consultationBookingSchema.index({ paymentStatus: 1, status: 1 });

// Virtual: Is upcoming
consultationBookingSchema.virtual('isUpcoming').get(function() {
  if (!this.confirmedDateTime) return false;
  return this.confirmedDateTime > new Date() && this.status === 'confirmed';
});

// Virtual: Full meeting details
consultationBookingSchema.virtual('fullSchedule').get(function() {
  const date = this.confirmedDateTime || this.preferredDate;
  const time = this.preferredTime;
  return { date, time, duration: this.duration };
});
```

### 1.3 Update Order Model

The existing `Order` model needs to support consultation bookings:

```javascript
// Add to Order model schema
orderType: {
  type: String,
  enum: ['course', 'consultation', 'subscription'],
  default: 'course'
},
consultationBookingId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'ConsultationBooking'
},
```

### 1.4 Update User Model

Add consultation-related fields to User model:

```javascript
// Add to User model schema
consultationBookings: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'ConsultationBooking'
}],
totalConsultations: {
  type: Number,
  default: 0
},
```

---

## 2. API Routes

### 2.1 Create `/server/src/routes/consultations.js`

#### Endpoints Structure:

**Public Routes:**
- `GET /api/consultations` - Get all active consultation types
- `GET /api/consultations/:id` - Get specific consultation type details

**Private Routes (Authenticated Users):**
- `POST /api/consultations/book` - Create new consultation booking
- `GET /api/consultations/my-bookings` - Get user's bookings
- `GET /api/consultations/booking/:bookingId` - Get specific booking details
- `PUT /api/consultations/booking/:bookingId/reschedule` - Reschedule booking
- `DELETE /api/consultations/booking/:bookingId/cancel` - Cancel booking
- `POST /api/consultations/booking/:bookingId/feedback` - Submit feedback after consultation

**Admin Routes:**
- `POST /api/consultations/create` - Create new consultation type
- `PUT /api/consultations/:id` - Update consultation type
- `DELETE /api/consultations/:id` - Delete consultation type
- `GET /api/consultations/bookings/all` - Get all bookings (with filters)
- `PUT /api/consultations/booking/:bookingId/confirm` - Confirm booking
- `PUT /api/consultations/booking/:bookingId/complete` - Mark as completed
- `GET /api/consultations/analytics` - Get consultation analytics

### 2.2 Detailed Route Implementation

#### `POST /api/consultations/book`

**Purpose**: Create a new consultation booking

**Flow**:
1. Validate user authentication
2. Get user details from database (email, name, phone, etc.)
3. Validate consultation type exists and is active
4. Check availability (no double booking)
5. Create consultation booking record with status: 'pending_payment'
6. Create payment order (similar to course enrollment)
7. Return booking details and payment link

**Request Body**:
```javascript
{
  consultationId: "consultation_mongo_id",
  preferredDate: "2025-10-25",
  preferredTime: "14:00",
  alternativeDate: "2025-10-26",
  alternativeTime: "15:00",
  meetingType: "online", // or "in_person"
  userDetails: {
    age: 28,
    gender: "male",
    weight: 75,
    height: 175,
    fitnessLevel: "intermediate",
    medicalConditions: "None",
    currentActivity: "Gym 3x week",
    goals: ["بناء العضلات", "زيادة القوة"],
    additionalNotes: "أرغب في التركيز على تمارين الذراعين"
  }
}
```

**Response**:
```javascript
{
  success: true,
  booking: {
    bookingNumber: "CB-20251025-0001",
    id: "booking_mongo_id",
    status: "pending_payment",
    consultationTitle: "...",
    amount: 100,
    currency: "USD"
  },
  payment: {
    orderId: "paypal_order_id",
    approvalUrl: "https://paypal.com/checkout/..."
  }
}
```

#### `GET /api/consultations/my-bookings`

**Purpose**: Get all bookings for the logged-in user

**Query Parameters**:
- `status` - Filter by status (optional)
- `upcoming` - Boolean, show only upcoming (optional)
- `page` - Pagination
- `limit` - Results per page

**Response**:
```javascript
{
  success: true,
  bookings: [
    {
      bookingNumber: "CB-20251025-0001",
      consultationTitle: "استشارة رياضية تأسيسية",
      status: "confirmed",
      confirmedDateTime: "2025-10-25T14:00:00Z",
      duration: 75,
      meetingType: "online",
      meetingLink: "https://zoom.us/...",
      amount: 100,
      paymentStatus: "completed"
    }
  ],
  pagination: {
    total: 5,
    page: 1,
    pages: 1
  }
}
```

---

## 3. Payment Integration

### 3.1 Update Payment Routes

Modify `/server/src/routes/payment.js` to support consultations:

```javascript
// POST /api/payment/paypal/create-order
// Update to handle both courses and consultations

if (req.body.consultationBookingId) {
  // Handle consultation payment
  const booking = await ConsultationBooking.findById(req.body.consultationBookingId);
  // Create order with orderType: 'consultation'
}
```

### 3.2 Payment Completion Flow

When payment is captured successfully:
1. Update Order status to 'completed'
2. Update ConsultationBooking:
   - `paymentStatus` → 'completed'
   - `status` → 'pending_confirmation' (if requiresApproval) or 'confirmed'
   - `paymentCompletedAt` → current timestamp
3. Update User:
   - Add booking to `consultationBookings` array
   - Increment `totalConsultations`
   - Update `totalSpent`
4. Send confirmation email to user
5. Send notification to admin

---

## 4. Frontend Implementation

### 4.1 Create Booking Page (`/client/src/app/consultations/book/page.tsx`)

**Features**:
- Auto-populate user information from logged-in user context
- Display consultation details
- Date/time picker for scheduling
- Meeting type selection (online/in-person)
- Additional user details form (health info, goals, etc.)
- Payment integration

**User Information Section** (المعلومات الشخصية):
```typescript
// Auto-populated from user context
const { user } = useAuth();

// Pre-filled fields:
- Name: user.displayName
- Email: user.email
- Phone: user.phone
- Gender: user.gender
- Fitness Level: user.fitnessLevel
- Goals: user.goals
```

**Form Structure**:
1. **Step 1**: Consultation Selection (if coming from link with ?type=ID, pre-select)
2. **Step 2**: Personal Information (auto-filled from user DB, editable)
3. **Step 3**: Scheduling (date, time, meeting type)
4. **Step 4**: Health & Goals Details
5. **Step 5**: Review & Payment

### 4.2 My Consultations Page (`/client/src/app/consultations/my-bookings/page.tsx`)

**Features**:
- List all user's bookings
- Filter by status (upcoming, completed, cancelled)
- View booking details
- Reschedule/cancel options
- Join meeting link (for confirmed bookings)
- Download receipt
- Leave feedback

### 4.3 TypeScript Interfaces

Create `/client/src/types/consultation.ts`:

```typescript
export interface Consultation {
  _id: string;
  consultationId: number;
  title: string;
  titleEn?: string;
  description: string;
  duration: string;
  durationMinutes: number;
  price: number;
  currency: string;
  category: 'sports' | 'life_coaching' | 'group' | 'vip';
  features: string[];
  image?: string;
  isActive: boolean;
  consultationType: 'online' | 'in_person' | 'both';
}

export interface ConsultationBooking {
  _id: string;
  bookingNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  consultationTitle: string;
  consultationCategory: string;
  preferredDate: Date;
  preferredTime: string;
  confirmedDateTime?: Date;
  duration: number;
  meetingType: 'online' | 'in_person';
  meetingLink?: string;
  userDetails: {
    age?: number;
    gender?: string;
    weight?: number;
    height?: number;
    fitnessLevel?: string;
    medicalConditions?: string;
    goals?: string[];
    additionalNotes?: string;
  };
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  status: 'pending_payment' | 'pending_confirmation' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.4 API Client Functions

Add to `/client/src/lib/api.ts`:

```typescript
export const consultationsAPI = {
  // Get all consultation types
  getAll: () => apiCall('/consultations'),
  
  // Get specific consultation
  getById: (id: string) => apiCall(`/consultations/${id}`),
  
  // Create booking
  createBooking: (data: any) => apiCall('/consultations/book', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Get user's bookings
  getMyBookings: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/consultations/my-bookings?${query}`);
  },
  
  // Get specific booking
  getBooking: (bookingId: string) => apiCall(`/consultations/booking/${bookingId}`),
  
  // Cancel booking
  cancelBooking: (bookingId: string, reason: string) => 
    apiCall(`/consultations/booking/${bookingId}/cancel`, {
      method: 'DELETE',
      body: JSON.stringify({ reason })
    }),
  
  // Reschedule booking
  rescheduleBooking: (bookingId: string, data: any) =>
    apiCall(`/consultations/booking/${bookingId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  
  // Submit feedback
  submitFeedback: (bookingId: string, feedback: any) =>
    apiCall(`/consultations/booking/${bookingId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback)
    })
};
```

---

## 5. Admin Panel Integration

### 5.1 Add to Admin Routes (`/server/src/routes/admin.js`)

```javascript
// Get all consultation bookings
router.get('/consultations/bookings', 
  requireAdmin, 
  requirePermission('consultations.view'),
  async (req, res) => {
    // Implementation
  }
);

// Confirm booking
router.put('/consultations/booking/:bookingId/confirm',
  requireAdmin,
  requirePermission('consultations.manage'),
  async (req, res) => {
    // Implementation
  }
);

// Get consultation analytics
router.get('/consultations/analytics',
  requireAdmin,
  requirePermission('analytics.view'),
  async (req, res) => {
    // Implementation
  }
);
```

### 5.2 Admin Dashboard Pages

Create admin pages:
- `/client/src/app/admin/consultations/page.tsx` - List all bookings
- `/client/src/app/admin/consultations/[id]/page.tsx` - Booking details
- `/client/src/app/admin/consultations/types/page.tsx` - Manage consultation types

### 5.3 Admin Permissions

Add to User model `adminPermissions`:
```javascript
'consultations.view',
'consultations.manage',
'consultations.create',
'consultations.delete'
```

---

## 6. Notifications & Reminders

### 6.1 Email Notifications

**Triggers**:
- Booking created (pending payment)
- Payment successful (booking confirmed)
- Admin confirmed booking
- 24 hours before consultation
- 1 hour before consultation
- Consultation completed (request feedback)
- Booking cancelled
- Booking rescheduled

### 6.2 Email Templates

Create email templates in `/server/src/utils/emailTemplates/`:
- `consultationBookingConfirmation.js`
- `consultationReminder.js`
- `consultationCompleted.js`
- `consultationCancelled.js`

---

## 7. Calendar Integration

### 7.1 Generate .ics File

Allow users to add consultation to their calendar:

```javascript
// server/src/utils/calendarUtils.js
function generateICS(booking) {
  // Generate iCalendar format
  // Return .ics file
}
```

### 7.2 Sync with Google Calendar (Optional)

Admin can sync confirmed bookings to Google Calendar for better management.

---

## 8. Analytics & Reporting

### 8.1 Consultation Metrics

Track:
- Total bookings
- Revenue by consultation type
- Completion rate
- Cancellation rate
- Average rating
- Popular time slots
- No-show rate

### 8.2 Admin Dashboard Widgets

Add to admin dashboard:
- Upcoming consultations (next 7 days)
- Pending confirmations
- Today's schedule
- Monthly revenue from consultations
- Popular consultation types

---

## 9. Data Migration

### 9.1 Seed Initial Consultation Types

Create `/server/src/scripts/seedConsultations.js`:

```javascript
// Import consultation types from client/src/data/consultations.ts
// Convert to MongoDB documents
// Insert into Consultation collection
```

---

## 10. Testing Strategy

### 10.1 Unit Tests
- Model validations
- API route handlers
- Payment flow
- Email sending

### 10.2 Integration Tests
- Complete booking flow (user books → pays → confirmed)
- Cancellation flow
- Rescheduling flow
- Admin confirmation flow

### 10.3 Manual Testing Checklist
- [ ] User can view consultations
- [ ] User info auto-populates from database
- [ ] Booking creation works
- [ ] Payment integration works
- [ ] Email notifications sent
- [ ] User can view bookings
- [ ] User can cancel booking
- [ ] Admin can confirm booking
- [ ] Admin can view analytics
- [ ] Calendar export works

---

## 11. Security Considerations

### 11.1 Authentication & Authorization
- All booking routes require authentication
- Users can only view/modify their own bookings
- Admins have full access with proper permissions

### 11.2 Data Validation
- Validate all input data (dates, times, amounts)
- Prevent SQL injection / NoSQL injection
- Sanitize user inputs

### 11.3 Payment Security
- Use HTTPS only
- Validate payment amounts server-side
- Prevent duplicate payments
- Store transaction IDs securely

### 11.4 Privacy
- Encrypt sensitive user health data
- GDPR compliance for data retention
- Allow users to delete their data

---

## 12. Implementation Timeline

### Phase 1: Backend Foundation (Week 1)
- [ ] Create Consultation model
- [ ] Create ConsultationBooking model
- [ ] Update Order and User models
- [ ] Create consultation routes
- [ ] Seed initial consultation types

### Phase 2: Payment Integration (Week 1-2)
- [ ] Update payment routes for consultations
- [ ] Test payment flow
- [ ] Implement booking confirmation logic

### Phase 3: Frontend - User Experience (Week 2-3)
- [ ] Create booking page
- [ ] Auto-populate user information
- [ ] Implement date/time picker
- [ ] Payment integration
- [ ] My Bookings page
- [ ] Booking details page

### Phase 4: Admin Panel (Week 3)
- [ ] Admin consultation management pages
- [ ] Booking confirmation workflow
- [ ] Analytics dashboard

### Phase 5: Notifications & Polish (Week 4)
- [ ] Email notifications
- [ ] Reminder system
- [ ] Calendar integration
- [ ] Testing and bug fixes

---

## 13. Future Enhancements

- **Video Consultation Integration**: Integrate Zoom/Google Meet API for automatic meeting creation
- **Recurring Consultations**: Allow booking multiple sessions at once
- **Group Consultations**: Support group bookings with multiple participants
- **Waiting List**: If time slot is full, allow users to join waiting list
- **SMS Reminders**: Send SMS reminders via Twilio
- **WhatsApp Integration**: Send booking confirmations via WhatsApp Business API
- **Mobile App**: Native iOS/Android apps
- **AI Scheduling**: Suggest best times based on availability
- **Multi-language Support**: Full English translation

---

## 14. Key Differentiators from Course System

| Feature | Courses | Consultations |
|---------|---------|---------------|
| **Nature** | One-time purchase, lifetime access | Time-based appointment |
| **Scheduling** | Self-paced | Requires date/time booking |
| **User Info** | Basic profile | Detailed health/fitness info required |
| **Confirmation** | Automatic enrollment | May require admin confirmation |
| **Meeting** | Pre-recorded videos | Live 1-on-1 or group session |
| **Follow-up** | Course progress tracking | Post-consultation notes & feedback |
| **Reminders** | None | Email/SMS reminders before session |

---

## 15. Success Metrics

After implementation, track:
- ✅ Booking conversion rate (views → bookings)
- ✅ Payment completion rate
- ✅ User satisfaction (average rating)
- ✅ No-show rate (target < 5%)
- ✅ Rescheduling rate
- ✅ Revenue from consultations
- ✅ Repeat booking rate

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building a professional consultation booking system. The key aspect is that **personal information (المعلومات الشخصية) is automatically populated from the user database**, making the booking process seamless while collecting necessary additional health and fitness information specific to consultations.

The system is designed to be scalable, secure, and user-friendly, following the same architectural patterns as the existing course enrollment system while adding consultation-specific features like scheduling, confirmations, and reminders.

