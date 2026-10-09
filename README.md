# Shop MK Finds

A React + Vite storefront for home decor and everyday essentials. Product catalogue remains in Sanity; checkout orders are persisted in Supabase, payments are initialized and verified with Paystack, and paid-order confirmation emails are sent through Mailgun.

## Stack
- React, Vite, React Router, Tailwind CSS
- Sanity product catalogue
- Supabase Postgres for orders and Supabase Auth for email/password accounts
- Paystack payments
- Netlify Functions for server-side checkout, payment verification, and admin order management
- Mailgun for confirmation emails

## Local development
```bash
npm install
cp .env.example .env
npm run dev
```
Vite serves the storefront, but Netlify Functions are required for checkout endpoints. Use the Netlify CLI to test the full app locally:
```bash
npm install --global netlify-cli
netlify dev
```

## Required setup before checkout works
1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. Set the server-only Netlify environment variables listed in `.env.example`. Never expose `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, `MAILGUN_API_KEY`, or `ADMIN_TOKEN` in frontend code or commit real secrets.
4. In Paystack, use a test secret key for test payments and set the production key only in Netlify environment variables.
5. Configure Mailgun with a verified sending domain and sender address.
6. Deploy to Netlify with build command `npm run build`, publish directory `dist`, and functions directory `netlify/functions`.
7. Set `SITE_URL` to the exact deployed site URL, then redeploy after adding or changing environment variables.

## Email/password account setup
1. In Supabase Authentication settings, enable the Email provider.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the frontend environment.
3. The account page is available at `/login`. If email confirmation is enabled, new users must confirm their email before signing in.

## Lesson 3: PWA and cross-device cart sync
1. In Supabase SQL Editor, run `supabase/cart-sync.sql` to create the protected `user_carts` table and enable Realtime.
2. Deploy the latest `main` branch to your HTTPS production domain. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the hosting provider and redeploy.
3. The PWA manifest is `/manifest.webmanifest`; the production service worker is `/sw.js`.
4. Open the deployed HTTPS URL in PWABuilder to check PWA readiness and package for Android.
5. On a physical Android phone, install the APK and test the same email/password account on web and app. Add an item on each platform and confirm both carts update.


## Database and security
- The server recalculates all prices from Sanity; it does not trust prices sent by the browser.
- Order records are accessed by server functions using the Supabase service-role key. RLS is enabled and direct access for `anon` and `authenticated` is revoked.
- Paystack verification checks reference, transaction status, amount, currency, and customer email before marking an order paid.
- The admin order endpoint requires a bearer token configured as `ADMIN_TOKEN`. Use a long random secret and do not share it.

## Test and verify
```bash
npm run build
npm run lint
```
Then verify on the deployed URL:
- Products load from Sanity.
- Add/remove/update cart items and refresh to check cart persistence.
- Submit invalid checkout details and confirm validation blocks payment.
- With Paystack test credentials, complete a test payment and verify the order appears in Supabase.
- Confirm a paid order sends an email to the customer via Mailgun.
- Open `/admin/orders`, authenticate with the configured admin token, and update a test order status.
- Open `/login` and test Google OAuth on the deployed domain.

A successful local build alone does not verify provider credentials, live payments, email delivery, OAuth configuration, or production deployment.
