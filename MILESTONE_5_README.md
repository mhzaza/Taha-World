# Milestone 5: Payment Integration with Stripe

This milestone implements a complete payment flow for course purchases using Stripe in test mode, with automatic enrollment upon successful payment.

## 🚀 Features Implemented

### 1. Payment Flow
- **Buy Now Button**: Added to course details page (`/courses/[id]`)
- **Checkout Session**: Creates Stripe checkout sessions via API
- **Success/Cancel Pages**: User-friendly pages for payment outcomes
- **Auto-enrollment**: Users are automatically enrolled after successful payment

### 2. API Routes
- `POST /api/checkout/session` - Creates Stripe checkout sessions
- `POST /api/webhooks/stripe` - Handles Stripe webhook events

### 3. Security Features
- Environment variables for sensitive keys
- Webhook signature verification
- Authentication required for checkout
- CORS and error handling

## 🔧 Environment Variables

Add these variables to your `.env.local` file:

```env
# Stripe Configuration (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000

# Firebase Configuration (existing)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Getting Stripe Keys

1. **Sign up for Stripe**: Go to [stripe.com](https://stripe.com) and create an account
2. **Get Test Keys**: In your Stripe dashboard, go to Developers > API keys
3. **Copy Keys**: 
   - Publishable key starts with `pk_test_`
   - Secret key starts with `sk_test_`
4. **Webhook Secret**: Create a webhook endpoint and copy the signing secret

## 🔗 Webhook Setup

### Local Development with Stripe CLI

1. **Install Stripe CLI**:
   ```bash
   # Windows (using Chocolatey)
   choco install stripe-cli
   
   # macOS (using Homebrew)
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook secret** from the CLI output and add it to `.env.local`

### Production Webhook Setup

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`
4. Copy the webhook signing secret

## 🧪 Testing the Payment Flow

### Test Cards (Stripe Test Mode)

```
# Successful Payment
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits

# Declined Payment
Card Number: 4000 0000 0000 0002

# Requires Authentication
Card Number: 4000 0025 0000 3155
```

### Testing Steps

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Start Stripe webhook forwarding** (in another terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Test the flow**:
   - Navigate to a course page (`/courses/1`)
   - Click "شراء الكورس الآن" (Buy Now)
   - Complete payment with test card
   - Verify redirect to success page
   - Check that user is enrolled in the course

## 📁 Files Created/Modified

### New Files

1. **`src/lib/stripe.ts`** - Stripe configuration and utilities
2. **`src/lib/checkout.ts`** - Checkout service and enrollment logic
3. **`src/app/api/checkout/session/route.ts`** - Checkout session API
4. **`src/app/api/webhooks/stripe/route.ts`** - Stripe webhook handler
5. **`src/app/success/page.tsx`** - Payment success page
6. **`src/app/cancel/page.tsx`** - Payment cancellation page

### Modified Files

1. **`src/app/courses/[id]/page.tsx`** - Added Buy Now button and purchase logic
2. **`.env.local`** - Added Stripe environment variables
3. **`package.json`** - Added Stripe dependencies

## 🔄 Data Flow

1. **User clicks "Buy Now"** → `handlePurchase()` function
2. **Create checkout session** → `POST /api/checkout/session`
3. **Redirect to Stripe** → User completes payment
4. **Stripe webhook** → `POST /api/webhooks/stripe`
5. **Update enrollment** → User added to course
6. **Redirect to success** → `/success` page

## 🛡️ Security Considerations

- ✅ Environment variables for sensitive data
- ✅ Webhook signature verification
- ✅ Authentication required for checkout
- ✅ CORS protection on API routes
- ✅ Input validation and sanitization
- ✅ Error handling and logging

## 🚨 Important Notes

1. **Test Mode Only**: All payments are in test mode
2. **Local Storage**: Enrollment data is stored locally (replace with Firestore in production)
3. **Authentication**: Uses placeholder tokens (integrate with Firebase Auth)
4. **Webhook Security**: Always verify webhook signatures in production
5. **Error Handling**: Implement proper error logging and monitoring

## 🔄 Next Steps

1. **Integrate Firebase Auth**: Replace placeholder authentication
2. **Add Firestore**: Store orders and enrollment in database
3. **Email Notifications**: Send confirmation emails
4. **Invoice Generation**: Create PDF invoices
5. **Refund Handling**: Implement refund webhook
6. **Multiple Payment Methods**: Add support for other gateways

## 🐛 Troubleshooting

### Common Issues

1. **Webhook not receiving events**:
   - Check Stripe CLI is running
   - Verify webhook URL is correct
   - Check firewall settings

2. **Payment fails**:
   - Verify Stripe keys are correct
   - Check test card numbers
   - Review browser console for errors

3. **Enrollment not working**:
   - Check webhook signature verification
   - Verify course ID in metadata
   - Check local storage or database

### Debug Commands

```bash
# Check Stripe CLI status
stripe status

# Test webhook locally
stripe trigger checkout.session.completed

# View webhook logs
stripe logs tail
```

---

**Ready for Review** ✅

The payment system is now fully functional in test mode. Users can purchase courses, get automatically enrolled, and access course content immediately after successful payment.