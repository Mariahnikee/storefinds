# AGENTS.md

## Project
Shop MK Finds: React/Vite storefront with Sanity catalogue, Supabase orders/auth, Paystack checkout, Mailgun email, and Netlify Functions.

## Commands
- `npm install`: install dependencies
- `npm run dev`: frontend only
- `netlify dev`: frontend plus Netlify Functions
- `npm run build`: production build
- `npm run lint`: lint

## Conventions
- Follow existing React component conventions and visual palette.
- Validate all untrusted input at API boundaries.
- Recalculate prices on the server from Sanity; never trust client totals.
- Keep service keys and provider secrets server-only in Netlify environment variables.
- Do not expose Supabase service-role key, Paystack secret, Mailgun API key, or admin token with a VITE_ prefix.
- Keep order/payment status transitions consistent with supabase/schema.sql.

## Architecture
- `src/`: storefront and browser UI.
- `src/lib/supabase.js`: browser Supabase Auth client.
- `netlify/functions/`: checkout, verification, admin endpoints.
- `netlify/lib/server.js`: shared server-side integrations.
- `supabase/schema.sql`: orders schema and access policy.
- `netlify.toml`: Netlify routing and deployment configuration.

## Agent constraints
- Inspect relevant files before editing; prefer small focused changes.
- Never invent or commit real secrets.
- Do not remove existing Sanity storefront or change product catalogue structure without approval.
- Never mark payment paid based on client-side claims; verify with Paystack server-side.
- Run build and lint after changes when a runtime is available. Document provider setup that cannot be verified locally.
