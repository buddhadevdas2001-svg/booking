# Booking — Next.js + Supabase Bus Booking App

A feature-rich bus booking application built with Next.js (App Router), Supabase (Postgres + Realtime + Edge Functions), and Stripe for payments. This repository contains the frontend application, Supabase migrations, and serverless Edge Functions used by the app.

## Quick overview

- Frontend: Next.js 13+ with the App Router and TypeScript
- Backend: Supabase (Postgres, Realtime, Auth, Storage, Edge Functions)
- Payments: Stripe (checkout + webhook handled by an Edge Function)
- Features: Admin dashboard, real-time seat locking, dynamic pricing, QR e-tickets, email/SMS notifications

---

## Prerequisites

- Node.js 18+
- npm or pnpm
- A Supabase project (for Postgres, Auth, Realtime, Storage)
- Stripe account (for payments)
- Optional: Resend (email) and Twilio (SMS) accounts

---

## Getting started (local)

1. Clone and install

```bash
git clone <repository-url>
cd booking
npm install
```

2. Copy environment variables

```bash
cp .env.example .env.local
```

On Windows (PowerShell):

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` and fill required values. Key variables used by the app include:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL` (optional, defaults to http://localhost:3000)
- `RESEND_API_KEY` (optional)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (optional)

Secrets that should be set in Supabase (production):

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY` (if used)

Use the Supabase CLI to set secrets in production or staging:

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_... STRIPE_WEBHOOK_SECRET=whsec_...
```

3. Run database migrations (Supabase CLI recommended)

```bash
# install supabase CLI if needed
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Alternatively, run the SQL files in `supabase/migrations/` in order via the Supabase SQL editor.

4. Deploy Edge Functions (optional for local dev if testing webhooks)

```bash
npx supabase functions deploy stripe-webhook
npx supabase functions deploy create-checkout
npx supabase functions deploy send-email
npx supabase functions deploy send-sms
npx supabase functions deploy generate-report
```

5. Start the app

```bash
npm run dev
```

Open http://localhost:3000

---

## Available scripts

- `npm run dev` — Run Next.js in development
- `npm run dev:turbo` — Alternate dev command
- `npm run build` — Build the app for production
- `npm run start` — Start the production build
- `npm run lint` — Run ESLint

These are defined in [package.json](package.json).

---

## Project layout (important folders)

- `src/app/` — Next.js App Router pages and layouts
- `src/components/` — Reusable UI components (admin, common, providers)
- `src/lib/` — Utilities and client setup (look at `src/lib/env.ts` for env defaults)
- `src/hooks/` — Custom React hooks
- `supabase/migrations/` — SQL migration files for DB schema and RLS
- `supabase/functions/` — Edge Functions (Stripe webhook, email, SMS, reports)
- `public/` — Static assets

---

## Notes on environment values

The repository includes `src/lib/env.ts` which falls back to sane defaults for local development. For production, always set real values in environment variables or Supabase secrets. The app reads public keys from `NEXT_PUBLIC_*` variables and server-only keys from `SUPABASE_SERVICE_ROLE_KEY`.

---

## Deployment

Recommended hosting for the Next.js app: Vercel or any platform supporting Next.js. For production:

1. Deploy the frontend (Vercel recommended).
2. Run migrations against the production Supabase project.
3. Deploy Edge Functions to Supabase.
4. Configure secrets and environment variables in your hosting provider.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Add tests where applicable
4. Open a pull request

---

## License

MIT

---

If you want, I can also:

- Remove `node_modules` or `.next` to reclaim space
- Add a small developer `README` with common commands
- Create a `.env.example` summary with required keys

Let me know which of those you'd like next.
