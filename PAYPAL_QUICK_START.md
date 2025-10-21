# 🚀 PayPal Quick Start Guide

## ⚡ Getting Started in 5 Minutes

### Step 1: Get Your PayPal Sandbox Credentials

1. Visit: **https://developer.paypal.com/**
2. Login and go to **"Apps & Credentials"**
3. Make sure **"Sandbox"** mode is selected
4. Click **"Create App"**
5. Name it: `Taha World` and click **Create**
6. Copy your credentials:
   - **Client ID** (visible immediately)
   - **Secret** (click "Show" to reveal)

### Step 2: Add Credentials to Your Project

Open: `/server/.env`

Replace these lines:
```bash
PAYPAL_CLIENT_ID=your-paypal-client-id-here
PAYPAL_CLIENT_SECRET=your-paypal-client-secret-here
```

With your actual credentials:
```bash
PAYPAL_CLIENT_ID=AZDGh23...your-actual-client-id
PAYPAL_CLIENT_SECRET=EMx...your-actual-secret
```

### Step 3: Restart Your Server

```bash
cd server
npm start
```

You should see: `✅ PayPal initialized in sandbox mode`

### Step 4: Test Payment

1. Go to your course page
2. Click **"Pay with PayPal"** button
3. Login with PayPal **sandbox test account**
4. Complete the payment

---

## 🧪 PayPal Sandbox Test Accounts

When you create an app, PayPal automatically creates test accounts.

To view them:
1. Go to: **https://developer.paypal.com/**
2. Click **"Sandbox" → "Accounts"**
3. You'll see:
   - **Personal** (Buyer account)
   - **Business** (Your merchant account)

**Test Login Example:**
```
Email: sb-12345@personal.example.com
Password: (shown in the accounts list)
```

---

## 📍 File Locations

### Where PayPal is Configured:

1. **Environment Variables** (credentials):
   ```
   /server/.env
   ```

2. **Backend Payment Logic**:
   ```
   /server/src/routes/payment.js
   ```

3. **Frontend PayPal Button**:
   ```
   /client/src/components/payment/PayPalButton.tsx
   ```

---

## 🎯 Configuration Modes

### Sandbox Mode (Testing)
```bash
# /server/.env
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-secret
```

### Live Mode (Production)
```bash
# /server/.env
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=your-live-client-id
PAYPAL_CLIENT_SECRET=your-live-secret
```

---

## ✅ Checklist

Before testing:
- [ ] Created PayPal Developer account
- [ ] Created sandbox app
- [ ] Copied Client ID
- [ ] Copied Client Secret
- [ ] Updated `/server/.env` file
- [ ] Restarted server
- [ ] Server shows "PayPal initialized in sandbox mode"

---

## 🔧 Troubleshooting

### Issue: "PayPal credentials not found"

**Solution:**
1. Check `/server/.env` has correct credentials
2. No quotes around values
3. Restart server

### Issue: "Authentication failed"

**Solution:**
- Using **sandbox** credentials in sandbox mode?
- Using **live** credentials in live mode?
- Credentials copied correctly (no extra spaces)?

### Issue: Payment doesn't complete

**Solution:**
1. Check browser console for errors
2. Check server logs
3. Verify you're using a test account to pay

---

## 💡 Pro Tips

1. **Start with Sandbox**
   - Always test in sandbox first
   - Don't use live mode until ready

2. **Keep Credentials Safe**
   - Never commit `.env` to git
   - Use different credentials for dev/production

3. **Monitor Transactions**
   - Check PayPal sandbox dashboard
   - View test transactions in real-time

4. **Test Edge Cases**
   - Test declined payments
   - Test cancellation
   - Test duplicate purchases

---

## 📚 Resources

- **Full Setup Guide**: See `PAYPAL_SETUP_GUIDE.md`
- **PayPal Docs**: https://developer.paypal.com/docs/
- **Sandbox Dashboard**: https://developer.paypal.com/dashboard/
- **Test Cards**: https://developer.paypal.com/tools/sandbox/card-testing/

---

## 🎉 You're Ready!

Your PayPal integration is now ready to accept payments!

**Next Steps:**
1. Test with sandbox account
2. Verify course enrollment works
3. When ready, switch to live mode
4. Start accepting real payments! 💰

---

Need help? Check the full guide: **PAYPAL_SETUP_GUIDE.md**

