# 💳 PayPal Integration Setup Guide

This guide will help you integrate real PayPal payments into your Taha World platform.

---

## 📋 Table of Contents
1. [Getting PayPal Credentials](#getting-paypal-credentials)
2. [Configuration](#configuration)
3. [Testing with Sandbox](#testing-with-sandbox)
4. [Going Live](#going-live)
5. [Troubleshooting](#troubleshooting)

---

## 🔑 Getting PayPal Credentials

### Step 1: Create a PayPal Developer Account

1. Go to [PayPal Developer Portal](https://developer.paypal.com/)
2. Click **"Log in to Dashboard"**
3. Sign in with your PayPal account or create a new one

### Step 2: Create an App

1. Once logged in, click **"Apps & Credentials"** in the top menu
2. Make sure you're in **"Sandbox"** mode (for testing)
3. Click **"Create App"** button
4. Fill in the details:
   - **App Name**: `Taha World Training Platform` (or any name you prefer)
   - **App Type**: Select **"Merchant"**
5. Click **"Create App"**

### Step 3: Get Your API Credentials

After creating the app, you'll see:
- **Client ID** - This is your `PAYPAL_CLIENT_ID`
- **Secret** - Click "Show" to reveal, this is your `PAYPAL_CLIENT_SECRET`

**⚠️ Important:** Keep these credentials secure and never commit them to GitHub!

---

## ⚙️ Configuration

### 1. Update Your Server `.env` File

Open `/server/.env` and add your PayPal credentials:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your-sandbox-client-id-here
PAYPAL_CLIENT_SECRET=your-sandbox-secret-here
PAYPAL_MODE=sandbox
# Change to 'live' for production
```

**For Sandbox (Testing):**
```bash
PAYPAL_CLIENT_ID=AZDGh23...your-sandbox-client-id
PAYPAL_CLIENT_SECRET=EMx...your-sandbox-secret
PAYPAL_MODE=sandbox
```

**For Production (Live):**
```bash
PAYPAL_CLIENT_ID=your-live-client-id
PAYPAL_CLIENT_SECRET=your-live-secret
PAYPAL_MODE=live
```

### 2. Restart Your Server

After updating the `.env` file:

```bash
cd server
npm start
```

---

## 🧪 Testing with Sandbox

### Create Test Accounts

1. In PayPal Developer Dashboard, go to **"Sandbox" → "Accounts"**
2. You'll see default test accounts or create new ones:
   - **Personal Account** (Buyer) - For testing purchases
   - **Business Account** (Seller) - For receiving payments

### Test Payment Flow

1. Start your application
2. Browse a course and click "Pay with PayPal"
3. You'll be redirected to PayPal sandbox
4. Log in with your **test Personal account** credentials
5. Complete the payment
6. You'll be redirected back to your success page

### Sandbox Test Credentials Example

PayPal provides test accounts like:
```
Email: sb-buyer123@personal.example.com
Password: test1234
```

---

## 🚀 Going Live

### Step 1: Switch to Live Mode

1. Go to [PayPal Developer Portal](https://developer.paypal.com/)
2. Switch from **"Sandbox"** to **"Live"** mode
3. Create a new app or use existing one
4. Get your **Live** Client ID and Secret

### Step 2: Update Environment Variables

```bash
# In /server/.env
PAYPAL_CLIENT_ID=your-LIVE-client-id-here
PAYPAL_CLIENT_SECRET=your-LIVE-secret-here
PAYPAL_MODE=live
```

### Step 3: Business Account Verification

For live mode, you need:
1. A verified PayPal Business account
2. Complete PayPal's verification process
3. Add bank account for receiving payments

### Step 4: Deploy

1. Update your production `.env` file
2. Restart your production server
3. Test with a small real payment first

---

## 🔍 Troubleshooting

### Common Issues

#### 1. "Authentication failed" error

**Solution:**
- Verify your Client ID and Secret are correct
- Check if you're using sandbox credentials in sandbox mode
- Make sure `.env` file is loaded (restart server)

#### 2. Payments not completing

**Solution:**
- Check server logs for errors
- Verify webhook URLs are configured
- Ensure your return URL is correct

#### 3. "CORS error" when redirecting

**Solution:**
- Update `CLIENT_URL` in your `.env` file:
```bash
CLIENT_URL=http://localhost:3000  # For development
CLIENT_URL=https://yourdomain.com  # For production
```

#### 4. User not enrolled after payment

**Solution:**
- Check the payment capture endpoint
- Verify database connection
- Check server logs in `/api/payment/paypal/capture`

### Enable Debug Mode

Add to your `.env`:
```bash
DEBUG=paypal:*
NODE_ENV=development
```

---

## 📊 Payment Flow Overview

```
User clicks "Pay with PayPal"
         ↓
Create PayPal Order (Backend)
         ↓
Redirect to PayPal
         ↓
User completes payment
         ↓
PayPal redirects back to success page
         ↓
Capture payment (Backend)
         ↓
Enroll user in course
         ↓
Show success message
```

---

## 🔐 Security Best Practices

1. **Never expose credentials:**
   - Keep `.env` in `.gitignore`
   - Use environment variables in production

2. **Validate all payments:**
   - Always verify payment status server-side
   - Don't trust client-side data

3. **Use HTTPS in production:**
   - PayPal requires HTTPS for live mode
   - Get SSL certificate for your domain

4. **Implement webhook verification:**
   - Verify webhook signatures
   - Handle webhook events properly

---

## 📞 Support

- **PayPal Developer Support:** https://developer.paypal.com/support/
- **PayPal Documentation:** https://developer.paypal.com/docs/
- **Community Forums:** https://www.paypal-community.com/

---

## ✅ Quick Checklist

Before going live:
- [ ] PayPal Business account verified
- [ ] Live API credentials obtained
- [ ] `.env` updated with live credentials
- [ ] Tested payment flow in sandbox
- [ ] SSL certificate installed (HTTPS)
- [ ] Error handling implemented
- [ ] Webhook endpoints configured
- [ ] Refund policy defined
- [ ] Privacy policy updated
- [ ] Terms of service updated

---

## 📝 Example Configuration

### Development Setup (Sandbox)
```bash
# server/.env
PAYPAL_CLIENT_ID=AZDGh23...sandbox-id
PAYPAL_CLIENT_SECRET=EMx...sandbox-secret
PAYPAL_MODE=sandbox
CLIENT_URL=http://localhost:3000
```

### Production Setup (Live)
```bash
# server/.env (production)
PAYPAL_CLIENT_ID=AX7Yk45...live-id
PAYPAL_CLIENT_SECRET=ELp...live-secret
PAYPAL_MODE=live
CLIENT_URL=https://taha-world.com
```

---

## 🎯 Next Steps

1. Get your sandbox credentials from PayPal Developer Portal
2. Update your `/server/.env` file
3. Restart the server
4. Test a payment with sandbox accounts
5. When ready, switch to live mode

Happy coding! 🚀

