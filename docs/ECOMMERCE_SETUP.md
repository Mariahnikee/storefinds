# Shop MK Finds ecommerce setup

## Architecture
- React/Vite storefront
- Sanity for products and orders
- Netlify Functions for the server-side API
- Paystack for online product payments
- Bolt delivery fee is separate and paid by the customer on delivery
- Optional Resend email notification to `storefinds@gmail.com`

## Netlify environment variables
Set these in Netlify Site configuration → Environment variables for the production site and deploy context:

- `PAYSTACK_SECRET_KEY`: Paystack test secret while testing; replace with the live secret only when going live.
- `SANITY_WRITE_TOKEN`: Sanity token with permission to create/update `shopMkOrder` documents.
- `ADMIN_TOKEN`: long random secret used by `/admin/orders`.
- `SITE_URL`: `https://storefinds.store`
- `ORDER_EMAIL`: `storefinds@gmail.com`
- `RESEND_API_KEY`: optional, for email notifications.
- `ORDER_FROM_EMAIL`: optional, sender address verified in Resend.

Never commit any of these values.

## Paystack webhook
In Paystack test mode, set the webhook URL to:

`https://storefinds.store/api/paystack-webhook`

Use the same webhook URL for live mode after switching to live keys.

## Sanity
The `shopMkOrder` document type is registered in the Studio. Deploy the updated Studio/schema before testing payments so the backend can create order documents.

## Test flow
1. Open the storefront.
2. Add an item to cart or use Buy Now.
3. Complete checkout.
4. Confirm the backend initializes Paystack using the server-only secret key.
5. Complete a Paystack test payment.
6. Confirm the webhook changes the order from `pending` to `paid` and `processing`.
7. Confirm the order appears in `/admin/orders` with the `ADMIN_TOKEN`.
8. Confirm Bolt is shown as separate delivery with pay-on-delivery.

## Going live
- Replace the test Paystack secret with the live secret in Netlify only.
- Configure the live webhook URL in Paystack.
- Test one small real transaction and verify the webhook/order/email flow before announcing checkout publicly.
