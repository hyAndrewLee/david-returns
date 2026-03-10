# EZReturns Production Checklist

## Critical (Must Complete Before Launch)

### Stripe Webhook Security
- [ ] **Add STRIPE_WEBHOOK_SECRET environment variable**
  - Go to Stripe Dashboard → Developers → Webhooks
  - Create a webhook endpoint pointing to: `https://yourdomain.com/api/webhooks/stripe`
  - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
  - Copy the webhook signing secret
  - Add as `STRIPE_WEBHOOK_SECRET` environment variable in Vercel

### Environment Variables
Verify all required environment variables are set in production:
- [x] STRIPE_SECRET_KEY (live key, not test key)
- [x] STRIPE_PUBLISHABLE_KEY (live key, not test key)
- [x] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (live key, not test key)
- [ ] STRIPE_WEBHOOK_SECRET (CRITICAL - see above)
- [x] SUPABASE_URL
- [x] SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY
- [x] SUPABASE_SERVICE_ROLE_KEY
- [x] BLOB_READ_WRITE_TOKEN
- [x] RESEND_API_KEY
- [x] NEXT_PUBLIC_URL (set to your production domain)
- [x] NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL (only needed for development)

## Important (Highly Recommended)

### Code Cleanup
- [ ] Remove debug console.log statements (optional but recommended)
- [ ] Test all flows: signup, signin, schedule pickup, payment, admin dashboard
- [ ] Test membership subscription flow end-to-end
- [ ] Test pay-as-you-go flow end-to-end

### Testing Checklist
- [ ] Customer can sign up and verify email
- [ ] Customer can schedule a pickup (instant and regular)
- [ ] Payment processing works correctly
- [ ] Dates display correctly as Eastern Time
- [ ] Orders show up in customer dashboard
- [ ] Orders show up in admin dashboard
- [ ] Admin can update order status
- [ ] Admin can upload proof photos
- [ ] Membership subscription works
- [ ] Membership cancellation works
- [ ] Webhooks are received and processed correctly
- [ ] Email notifications work (contact form)

### Security Checklist
- [x] Row Level Security (RLS) enabled on all Supabase tables
- [x] Admin routes protected with middleware
- [x] User data isolated (users can only see their own orders)
- [x] Service role key used only in server-side code
- [ ] Stripe webhook signature verification enabled (add STRIPE_WEBHOOK_SECRET)
- [x] Input validation on all forms
- [x] File uploads restricted to images only

### Performance
- [x] Images optimized with Next.js Image component
- [x] Database queries use proper indexes
- [x] Realtime subscriptions properly cleaned up

## Nice to Have (Can Do After Launch)

- [ ] Set up error monitoring (Sentry)
- [ ] Set up analytics
- [ ] Add rate limiting to API routes
- [ ] Set up automated backups
- [ ] Add customer email notifications for order updates
- [ ] Add SMS notifications

## Current Status

**NOT PRODUCTION READY** - Missing critical STRIPE_WEBHOOK_SECRET

Once STRIPE_WEBHOOK_SECRET is added, the application will be ready for production deployment.
