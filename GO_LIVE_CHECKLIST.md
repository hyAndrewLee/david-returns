# Go Live Checklist for David Returns

Complete these steps before launching to production:

## 1. Stripe Configuration (CRITICAL)

### Switch to Live Mode

- [ ] Go to your Stripe Dashboard
- [ ] Toggle from **Test Mode** to **Live Mode** (top right)
- [ ] Copy your **Live Publishable Key** (starts with `pk_live_...`)
- [ ] Copy your **Live Secret Key** (starts with `sk_live_...`)
- [ ] In v0: Click **Vars** → Update these environment variables:
  - `STRIPE_PUBLISHABLE_KEY` = your live publishable key
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = your live publishable key
  - `STRIPE_SECRET_KEY` = your live secret key

### Configure Live Webhook

- [ ] In Stripe Dashboard → Developers → Webhooks
- [ ] Click **Add Endpoint**
- [ ] Enter URL: `https://davidreturns.com/api/webhooks/stripe`
- [ ] Select events to listen for:
  - ✓ `checkout.session.completed`
  - ✓ `customer.subscription.updated`
  - ✓ `customer.subscription.deleted`
- [ ] Click **Add endpoint**
- [ ] Copy the **Signing Secret** (starts with `whsec_...`)
- [ ] In v0: Click **Vars** → Add/Update:
  - `STRIPE_WEBHOOK_SECRET` = your webhook signing secret

### Test Live Payment

- [ ] Use a **real credit card** to place a $7.00 test order
- [ ] Verify order appears in your admin dashboard
- [ ] Verify you receive confirmation email
- [ ] Verify payment shows in Stripe Dashboard
- [ ] **Immediately refund the test payment** in Stripe Dashboard

## 2. Supabase Configuration

### Enable Realtime

- [ ] Go to Supabase Dashboard → Database → Replication
- [ ] Find the `orders` table
- [ ] Toggle **Realtime** to ON
- [ ] Click **Save**
- [ ] Test: Update order status in admin, verify customer sees change instantly

### Verify RLS Policies

- [ ] In Supabase Dashboard → Database → Tables → orders
- [ ] Click **RLS** tab
- [ ] Verify these policies exist and are enabled:
  - Users can view their own orders
  - Users can update their own orders
  - Service role can do everything

## 3. Admin Access

### Secure Admin Credentials

- [ ] In v0: Click **Vars** → Update:
  - `ADMIN_USERNAME` = Choose a strong username (not "admin")
  - `ADMIN_PASSWORD` = Choose a strong password (20+ characters)
- [ ] Test login at `https://davidreturns.com/manage/login`
- [ ] Save credentials in a secure password manager

## 4. Email Configuration

### Verify Resend Setup

- [ ] Confirm `RESEND_API_KEY` is set in environment variables
- [ ] Send a test order and confirm you receive the email
- [ ] Check spam folder if email doesn't arrive
- [ ] Verify sender is `hello@davidreturns.com` or your verified domain

## 5. Optional Configuration (Development/Preview Only)

### Debug Logging (Optional)

These are **NOT required** for production. Production mode automatically:

- Enforces webhook signature verification
- Validates environment variables on startup
- Disables debug logs

Only set these if you want to test production behavior in dev/preview:

- [ ] `ENFORCE_WEBHOOK_SECRET=true` - Forces webhook verification in dev mode
- [ ] `VALIDATE_ENV=true` - Enables env validation in dev mode
- [ ] `NEXT_PUBLIC_DEBUG=false` - Explicitly disables debug console.logs

**Recommendation:** Leave these unset. They're only useful for testing.

## 6. Final Verification

### End-to-End Test

- [ ] Sign up as a new customer with real email
- [ ] Schedule an instant pickup
- [ ] Complete payment with real card
- [ ] Verify order confirmation email received
- [ ] Log into admin dashboard
- [ ] View the order and verify all details show correctly
- [ ] Update order status to "picked"
- [ ] Verify customer sees status update in real-time
- [ ] Update order status to "completed"
- [ ] **Refund the test payment in Stripe**

### Performance Check

- [ ] Test on mobile (iPhone Safari, Android Chrome)
- [ ] Test file upload with photos from phone
- [ ] Verify pages load in < 2 seconds
- [ ] Check for any console errors in browser

### Security Check

- [ ] Verify `/manage/dashboard` redirects to login when not authenticated
- [ ] Verify customers can only see their own orders
- [ ] Verify file uploads work without errors
- [ ] Verify Stripe webhook rejects requests without valid signature

## 7. Monitoring Setup

### Post-Launch Monitoring

- [ ] Check Vercel logs for errors: `vercel logs --follow`
- [ ] Monitor Stripe Dashboard for failed payments
- [ ] Monitor Supabase Dashboard for database errors
- [ ] Set up email alerts for failed orders (optional)

## You're Ready! 🚀

Once all items are checked, your app is production-ready and secure.

**First 48 Hours:**

- Monitor logs closely
- Test a few real orders yourself
- Be ready to roll back if critical issues appear

**Support Resources:**

- Stripe Support: https://support.stripe.com
- Supabase Support: https://supabase.com/support
- Vercel Support: https://vercel.com/help
