# 📍 Where to Add PayPal Credentials

## 🎯 Quick Answer

**Add your PayPal credentials here:**

```
📂 Taha-World/
  └── 📂 server/
      └── 📄 .env   <-- ADD PAYPAL CREDENTIALS HERE!
```

---

## 🔑 What to Add

Open the file: `/server/.env`

Find these lines at the bottom:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your-paypal-client-id-here
PAYPAL_CLIENT_SECRET=your-paypal-client-secret-here
PAYPAL_MODE=sandbox
```

**Replace** `your-paypal-client-id-here` and `your-paypal-client-secret-here` with your actual PayPal credentials.

---

## 📸 Visual Guide

### Before (Template):
```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your-paypal-client-id-here
PAYPAL_CLIENT_SECRET=your-paypal-client-secret-here
PAYPAL_MODE=sandbox
```

### After (With Your Credentials):
```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=AZDGh23x4vb7h8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5
PAYPAL_CLIENT_SECRET=EMxABCDEF123456789ghijklmnopqrstuvwxyz123456789ABC
PAYPAL_MODE=sandbox
```

---

## 🌐 Where to Get PayPal Credentials

### 1. Go to PayPal Developer Portal
🔗 **https://developer.paypal.com/**

### 2. Login & Create App
- Click **"Apps & Credentials"**
- Select **"Sandbox"** mode (top tab)
- Click **"Create App"** button
- Name it: `Taha World Training`
- Click **"Create App"**

### 3. Copy Credentials
You'll see two things:

**Client ID** (shown immediately)
```
Example: AZDGh23x4vb7h8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5
```

**Secret** (click "Show" to reveal)
```
Example: EMxABCDEF123456789ghijklmnopqrstuvwxyz123456789ABC
```

---

## ⚙️ Complete Example

Here's what your `/server/.env` should look like:

```bash
# Server Configuration
PORT=5050
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://...
DB_NAME=taha_world

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d

# PayPal Configuration  ← THIS SECTION!
PAYPAL_CLIENT_ID=AZDGh23x4vb7h8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5
PAYPAL_CLIENT_SECRET=EMxABCDEF123456789ghijklmnopqrstuvwxyz123456789ABC
PAYPAL_MODE=sandbox

# Other configurations...
```

---

## 🚀 After Adding Credentials

### 1. Restart Your Server
```bash
cd server
npm start
```

### 2. Look for Success Message
You should see in the terminal:
```
✅ PayPal initialized in sandbox mode
```

### 3. Test Payment
- Go to any course page
- Click "Pay with PayPal"
- Complete test payment

---

## 🧪 For Testing vs Production

### Testing (Sandbox Mode)
```bash
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-secret
```
✅ Use this for development and testing

### Production (Live Mode)
```bash
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=your-live-client-id
PAYPAL_CLIENT_SECRET=your-live-secret
```
⚠️ Use this only when ready to accept real payments

---

## ❓ Common Questions

### Q: Where exactly is the .env file?
**A:** In your project: `/server/.env`

Full path: `/Users/macbook/Documents/GitHub/Taha-World/server/.env`

### Q: Do I need quotes around the values?
**A:** No! Just paste the values directly:
```bash
✅ Correct:
PAYPAL_CLIENT_ID=AZDGh23x4vb7h8j9k0l1

❌ Wrong:
PAYPAL_CLIENT_ID="AZDGh23x4vb7h8j9k0l1"
PAYPAL_CLIENT_ID='AZDGh23x4vb7h8j9k0l1'
```

### Q: What if I don't see the .env file?
**A:** It might be hidden. Use:
```bash
ls -la server/
```

Or open it directly:
```bash
nano server/.env
# or
code server/.env
```

### Q: Is it safe to commit .env to GitHub?
**A:** NO! Never commit `.env` files with credentials. It's already in `.gitignore`.

---

## 📚 More Help

- **Quick Start**: See `PAYPAL_QUICK_START.md`
- **Full Setup Guide**: See `PAYPAL_SETUP_GUIDE.md`
- **PayPal Docs**: https://developer.paypal.com/docs/

---

## ✅ Summary

1. Open: `/server/.env`
2. Find PayPal section (at the bottom)
3. Replace placeholder values with your credentials
4. Save the file
5. Restart server with `npm start`
6. Look for: `✅ PayPal initialized in sandbox mode`
7. Test payment!

**That's it! You're ready to accept PayPal payments! 🎉**

