# Shamolly Clone - Bus Agency Management System

A comprehensive bus booking system built with **Supabase** (complete backend solution) and **Next.js**, featuring real-time seat locking, Stripe payments, and dynamic pricing.

## 🚀 Features

### Core Features
- ✅ **Admin Dashboard** - Complete bus and trip management
- ✅ **Real-time Seat Booking** - Live seat locking with 5-minute expiry
- ✅ **Dynamic Pricing Engine** - Peak hour and demand-based pricing
- ✅ **Stripe Payment Integration** - Secure payment processing
- ✅ **QR Code E-Tickets** - Digital tickets with QR codes
- ✅ **Email/SMS Notifications** - Automated booking confirmations
- ✅ **Multi-deck Seat Mapping** - Drag & drop seat layout designer
- ✅ **Route & Trip Management** - Complete scheduling system
- ✅ **Staff Management** - Driver and conductor assignments
- ✅ **Analytics & Reports** - Booking insights and revenue tracking

### Technical Features
- ✅ **Supabase-Only Backend** - No Node.js server needed
- ✅ **Row Level Security** - Database-level access control
- ✅ **Realtime Subscriptions** - Live updates via WebSocket
- ✅ **Edge Functions** - Serverless business logic
- ✅ **Storage Integration** - File uploads for images and documents
- ✅ **Auto-generated REST API** - Instant API from database schema

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Next.js App)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Pages: Admin | Dashboard | Search | Booking |      │   │
│  │         Layout Designer | Checkout | Success        │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Supabase Client SDK                      │   │
│  │  createClient() → auth | db | storage | realtime   │   │
│  │                   | functions                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE BACKEND                          │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐   │
│  │   PostgreSQL   │  │     Auth       │  │  Realtime   │   │
│  │   Database     │  │                │  │             │   │
│  │ • 13 Tables    │  │ • JWT Tokens   │  │ • WebSocket │   │
│  │ • Functions    │  │ • RLS Policies │  │ • Broadcast  │   │
│  │ • Triggers     │  │ • OAuth        │  │ • Presence   │   │
│  └────────────────┘  └────────────────┘  └─────────────┘   │
│                                                            │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐   │
│  │    Storage     │  │ Edge Functions │  │ Extensions  │   │
│  │                │  │                │  │             │   │
│  │ • Bus Images   │  │ • Stripe       │  │ • pgvector  │   │
│  │ • QR Codes     │  │ • Emails       │  │ • PostGIS   │   │
│  │ • Documents    │  │ • Reports      │  │ • pgcrypto  │   │
│  └────────────────┘  └────────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                           │
├─────────────────────────────────────────────────────────────┤
│  Stripe API  │  Resend Email  │  Twilio SMS  │  Maps API    │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- Node.js 18+
- Supabase account
- Stripe account
- Resend account (for emails)
- Twilio account (for SMS)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd shamolly-clone
npm install
```

### 2. Environment Setup

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Optional: External Services
RESEND_API_KEY=re_xxx
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Database Setup

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install supabase --save-dev

# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

#### Option B: Manual SQL Execution

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run each migration file in order:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_functions.sql`
   - `005_comprehensive_functions.sql`
   - `006_storage_configuration.sql`
   - `007_realtime_configuration.sql`

### 4. Deploy Edge Functions

```bash
# Deploy all edge functions
npx supabase functions deploy stripe-webhook
npx supabase functions deploy create-checkout
npx supabase functions deploy send-email
npx supabase functions deploy send-sms
npx supabase functions deploy generate-report
```

### 5. Set Environment Secrets

```bash
# Set Supabase secrets
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
npx supabase secrets set RESEND_API_KEY=re_xxx
npx supabase secrets set TWILIO_ACCOUNT_SID=ACxxx
npx supabase secrets set TWILIO_AUTH_TOKEN=your-token
npx supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
```

### 6. Run Development Server

```bash
npm run dev
```

## 📁 Project Structure

```
project/
├── supabase/
│   ├── migrations/          # Database schema & functions
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_functions.sql
│   │   ├── 005_comprehensive_functions.sql
│   │   ├── 006_storage_configuration.sql
│   │   └── 007_realtime_configuration.sql
│   └── functions/           # Edge Functions
│       ├── stripe-webhook/
│       ├── create-checkout/
│       ├── send-email/
│       └── generate-report/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/          # Admin dashboard
│   │   ├── auth/           # Authentication
│   │   ├── book/           # Seat selection
│   │   ├── checkout/       # Payment flow
│   │   ├── dashboard/      # User dashboard
│   │   └── search/         # Trip search
│   ├── components/         # Reusable components
│   │   ├── admin/         # Admin components
│   │   ├── common/        # Shared components
│   │   └── providers/     # Context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities & configurations
│   │   ├── supabase/      # Supabase client setup
│   │   ├── stripe.ts      # Stripe integration
│   │   └── api.ts         # API functions
│   ├── store/             # Zustand state management
│   └── types/             # TypeScript definitions
├── public/                # Static assets
└── package.json
```

## 🗄️ Database Schema

### Core Tables

- **profiles** - User profiles (extends auth.users)
- **buses** - Bus information and features
- **routes** - Origin/destination routes
- **trips** - Scheduled bus trips
- **bookings** - Customer bookings
- **booking_seats** - Individual seat bookings
- **seat_locks** - Temporary seat reservations
- **seat_layouts** - Bus seat configurations
- **staff** - Drivers and conductors
- **notifications** - User notifications
- **reviews** - Trip reviews and ratings
- **coupons** - Discount codes
- **audit_logs** - System audit trail
- **pricing_logs** - Dynamic pricing history

### Key Functions

- `lock_seats()` - Real-time seat locking
- `calculate_dynamic_price()` - Dynamic pricing calculation
- `get_available_seats()` - Available seats query
- `update_trip_prices()` - Price adjustment triggers

## 🔐 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Secure user sessions
- **Input Validation** - Client and server-side validation
- **SQL Injection Prevention** - Parameterized queries
- **Audit Logging** - Complete activity tracking
- **PCI DSS Compliance** - Secure payment processing

## 💳 Payment Flow

```
1. User selects seats
   ↓
2. Frontend calls: supabase.rpc('lock_seats', {...})
   ↓
3. Database locks seats with 5-minute expiry
   ↓
4. Realtime broadcasts seat lock to all connected clients
   ↓
5. User proceeds to Stripe checkout
   ↓
6. Stripe webhook → Edge Function
   ↓
7. Edge Function verifies payment, creates booking
   ↓
8. Email sent via Resend Edge Function
   ↓
9. QR Code generated and stored
   ↓
10. Realtime updates all clients with final booking
```

## 🎨 UI Components

### Admin Dashboard
- Bus management with drag & drop seat designer
- Trip scheduling and route management
- Staff assignment and analytics
- Real-time booking monitoring

### Customer Portal
- Trip search with filters
- Interactive seat selection
- Real-time seat availability
- Secure Stripe checkout
- Booking history and QR codes

## 📊 Analytics & Reporting

### Available Reports
- Daily/weekly/monthly revenue
- Popular routes and peak times
- Customer booking patterns
- Staff performance metrics
- Dynamic pricing effectiveness

### Real-time Dashboards
- Live booking activity
- Seat occupancy rates
- Revenue tracking
- Customer satisfaction scores

## 🚀 Deployment

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Supabase Production Setup

1. Create production Supabase project
2. Run migrations on production database
3. Deploy edge functions
4. Configure custom domain
5. Set up monitoring and backups

## 🔧 Development

### Code Quality
```bash
# Lint code
npm run lint

# Type checking
npm run type-check

# Build for production
npm run build
```

### Testing
```bash
# Run tests
npm test

# E2E testing
npm run test:e2e
```

## 📚 API Reference

### Supabase Auto-generated APIs

All tables automatically get REST endpoints:
- `GET /rest/v1/buses` - List buses
- `POST /rest/v1/bookings` - Create booking
- `GET /rest/v1/trips?route_id=eq.{id}` - Search trips

### Custom Edge Functions

- `stripe-webhook` - Handle Stripe webhooks
- `create-checkout` - Create Stripe checkout sessions
- `send-email` - Send booking confirmation emails
- `generate-report` - Generate analytics reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our Discord community

---

**Built with ❤️ using Supabase and Next.js**
    "next": "16.2.1",
    "qrcode.react": "^4.2.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-hot-toast": "^2.6.0",
    "recharts": "^3.8.0",
    "tailwind-merge": "^3.5.0",
    "zustand": "^5.0.12"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-plugin-react-compiler": "1.0.0",
    "eslint": "^9",
    "eslint-config-next": "16.2.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}

```

## tsconfig.json

`$lang
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}

```

## eslint.config.mjs

`$lang
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

```

## postcss.config.mjs

`$lang
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

```

## public\bus-banner.svg

`$lang
<svg width="1800" height="980" viewBox="0 0 1800 980" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="nightSky" x1="900" y1="40" x2="900" y2="980" gradientUnits="userSpaceOnUse">
      <stop stop-color="#547EE6"/>
      <stop offset="0.42" stop-color="#2D57B1"/>
      <stop offset="1" stop-color="#0A1637"/>
    </linearGradient>
    <radialGradient id="headlightGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1336 520) rotate(90) scale(150 260)">
      <stop stop-color="#FFF7D8" stop-opacity="0.8"/>
      <stop offset="1" stop-color="#FFF7D8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cityGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1260 156) rotate(90) scale(126 126)">
      <stop stop-color="#FFFFFF" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="busPaint" x1="608" y1="320" x2="1356" y2="748" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F8FBFF" stop-opacity="0.28"/>
      <stop offset="0.52" stop-color="#CFE0FF" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#92AEEA" stop-opacity="0.06"/>
    </linearGradient>
    <linearGradient id="windowGlass" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#C8D8FF" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#E7F0FF" stop-opacity="0.08"/>
    </linearGradient>
    <linearGradient id="roadFade" x1="900" y1="612" x2="900" y2="980" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0D1B43" stop-opacity="0"/>
      <stop offset="1" stop-color="#050B19" stop-opacity="0.88"/>
    </linearGradient>
  </defs>

  <rect width="1800" height="980" fill="url(#nightSky)"/>
  <circle cx="1260" cy="156" r="126" fill="url(#cityGlow)"/>

  <path d="M0 720C232 630 494 618 760 666C1040 716 1318 706 1800 566V980H0V720Z" fill="url(#roadFade)"/>
  <path d="M0 636C134 574 286 536 460 538C648 540 790 604 1018 602C1270 600 1490 520 1800 374V650C1448 744 1168 760 854 712C536 664 242 674 0 760V636Z" fill="white" fill-opacity="0.08"/>

  <g opacity="0.97">
    <path d="M526 402C526 348.98 568.98 306 622 306H1270C1343.45 306 1403 365.549 1403 439V598C1403 673.663 1341.66 735 1266 735H626C570.772 735 526 690.228 526 635V402Z" fill="url(#busPaint)"/>
    <path d="M526 402C526 348.98 568.98 306 622 306H1270C1343.45 306 1403 365.549 1403 439V598C1403 673.663 1341.66 735 1266 735H626C570.772 735 526 690.228 526 635V402Z" stroke="white" stroke-opacity="0.2" stroke-width="6"/>
    <path d="M592 368C592 349.222 607.222 334 626 334H1234C1252.78 334 1268 349.222 1268 368V494H592V368Z" fill="url(#windowGlass)"/>
    <rect x="618" y="358" width="174" height="108" rx="20" fill="white" fill-opacity="0.11"/>
    <rect x="812" y="358" width="174" height="108" rx="20" fill="white" fill-opacity="0.11"/>
    <rect x="1006" y="358" width="174" height="108" rx="20" fill="white" fill-opacity="0.11"/>
    <rect x="1200" y="410" width="94" height="190" rx="18" fill="white" fill-opacity="0.08"/>
    <path d="M582 528H1344" stroke="white" stroke-opacity="0.15" stroke-width="6" stroke-linecap="round"/>
    <path d="M640 602H1184" stroke="white" stroke-opacity="0.18" stroke-width="11" stroke-linecap="round"/>
    <path d="M542 444H470C441.281 444 418 467.281 418 496V570C418 598.719 441.281 622 470 622H526" stroke="white" stroke-opacity="0.16" stroke-width="6" stroke-linecap="round"/>
    <path d="M1404 432H1464C1490.51 432 1512 453.49 1512 480V562C1512 588.51 1490.51 610 1464 610H1386" stroke="white" stroke-opacity="0.16" stroke-width="6" stroke-linecap="round"/>
    <circle cx="672" cy="738" r="72" fill="#081733" fill-opacity="0.7"/>
    <circle cx="672" cy="738" r="42" fill="#EDF4FF" fill-opacity="0.92"/>
    <circle cx="1194" cy="738" r="72" fill="#081733" fill-opacity="0.7"/>
    <circle cx="1194" cy="738" r="42" fill="#EDF4FF" fill-opacity="0.92"/>
    <circle cx="1328" cy="532" r="13" fill="#FFF8DE" fill-opacity="0.8"/>
    <circle cx="1328" cy="532" r="150" fill="url(#headlightGlow)"/>
  </g>

  <g opacity="0.22">
    <rect x="112" y="154" width="14" height="54" rx="7" fill="white"/>
    <rect x="154" y="132" width="14" height="76" rx="7" fill="white"/>
    <rect x="196" y="102" width="14" height="106" rx="7" fill="white"/>
    <rect x="238" y="146" width="14" height="62" rx="7" fill="white"/>
    <rect x="1500" y="132" width="14" height="76" rx="7" fill="white"/>
    <rect x="1542" y="104" width="14" height="104" rx="7" fill="white"/>
    <rect x="1584" y="148" width="14" height="60" rx="7" fill="white"/>
  </g>
</svg>

```

## public\file.svg

`$lang
<svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#666" fill-rule="evenodd"/></svg>
```

## public\globe.svg

`$lang
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
```

## public\next.svg

`$lang
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 394 80"><path fill="#000" d="M262 0h68.5v12.7h-27.2v66.6h-13.6V12.7H262V0ZM149 0v12.7H94v20.4h44.3v12.6H94v21h55v12.6H80.5V0h68.7zm34.3 0h-17.8l63.8 79.4h17.9l-32-39.7 32-39.6h-17.9l-23 28.6-23-28.6zm18.3 56.7-9-11-27.1 33.7h17.8l18.3-22.7z"/><path fill="#000" d="M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Zm252.6-.4c-1 0-1.8-.4-2.5-1s-1.1-1.6-1.1-2.6.3-1.8 1-2.5 1.6-1 2.6-1 1.8.3 2.5 1a3.4 3.4 0 0 1 .6 4.3 3.7 3.7 0 0 1-3 1.8zm23.2-33.5h6v23.3c0 2.1-.4 4-1.3 5.5a9.1 9.1 0 0 1-3.8 3.5c-1.6.8-3.5 1.3-5.7 1.3-2 0-3.7-.4-5.3-1s-2.8-1.8-3.7-3.2c-.9-1.3-1.4-3-1.4-5h6c.1.8.3 1.6.7 2.2s1 1.2 1.6 1.5c.7.4 1.5.5 2.4.5 1 0 1.8-.2 2.4-.6a4 4 0 0 0 1.6-1.8c.3-.8.5-1.8.5-3V45.5zm30.9 9.1a4.4 4.4 0 0 0-2-3.3 7.5 7.5 0 0 0-4.3-1.1c-1.3 0-2.4.2-3.3.5-.9.4-1.6 1-2 1.6a3.5 3.5 0 0 0-.3 4c.3.5.7.9 1.3 1.2l1.8 1 2 .5 3.2.8c1.3.3 2.5.7 3.7 1.2a13 13 0 0 1 3.2 1.8 8.1 8.1 0 0 1 3 6.5c0 2-.5 3.7-1.5 5.1a10 10 0 0 1-4.4 3.5c-1.8.8-4.1 1.2-6.8 1.2-2.6 0-4.9-.4-6.8-1.2-2-.8-3.4-2-4.5-3.5a10 10 0 0 1-1.7-5.6h6a5 5 0 0 0 3.5 4.6c1 .4 2.2.6 3.4.6 1.3 0 2.5-.2 3.5-.6 1-.4 1.8-1 2.4-1.7a4 4 0 0 0 .8-2.4c0-.9-.2-1.6-.7-2.2a11 11 0 0 0-2.1-1.4l-3.2-1-3.8-1c-2.8-.7-5-1.7-6.6-3.2a7.2 7.2 0 0 1-2.4-5.7 8 8 0 0 1 1.7-5 10 10 0 0 1 4.3-3.5c2-.8 4-1.2 6.4-1.2 2.3 0 4.4.4 6.2 1.2 1.8.8 3.2 2 4.3 3.4 1 1.4 1.5 3 1.5 5h-5.8z"/></svg>
```

## public\vercel.svg

`$lang
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1155 1000"><path d="m577.3 0 577.4 1000H0z" fill="#fff"/></svg>
```

## public\window.svg

`$lang
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
```

## src\proxy.ts

`$lang
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // Protect admin routes
    if (pathname.startsWith('/admin') && !user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Protect dashboard routes for customers
    if (pathname.startsWith('/dashboard') && !user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // If user is already logged in and tries to access auth pages, redirect
    if (user && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*', '/auth/:path*'],
}

```

## src\app\favicon.ico

`$lang
[binary file omitted]
```

## src\app\globals.css

`$lang
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #111827;
  --brand-blue: #3969c5;
  --brand-blue-deep: #2b4fa7;
  --brand-yellow: #f5b433;
  --surface: #f8fafc;
  --border: #e2e8f0;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  overflow-x: hidden;
  background: var(--background);
  color: var(--foreground);
  font-family: 'Poppins', sans-serif;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.25s ease, color 0.25s ease;
}

html.dark body {
  background:
    radial-gradient(circle at top center, rgba(63, 102, 201, 0.18), transparent 24%),
    radial-gradient(circle at bottom left, rgba(245, 180, 51, 0.08), transparent 20%),
    linear-gradient(180deg, #08101d 0%, #0b1324 42%, #121b2f 100%);
  color: #f8fafc;
}

a {
  color: inherit;
  text-decoration: none;
}

h1,
h2,
h3,
h4,
h5,
h6,
.outfit {
  font-family: 'Outfit', sans-serif;
  letter-spacing: -0.03em;
}

input,
select,
button,
textarea {
  font: inherit;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #edf2f7;
}

::-webkit-scrollbar-thumb {
  background: #c3d1ee;
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9eb5e4;
}

.section-shell {
  @apply mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8;
}

.home-field-shell {
  @apply relative overflow-hidden rounded-[1.2rem] bg-slate-50;
}

.home-field {
  @apply w-full border-0 bg-transparent px-5 py-4 pr-12 text-lg text-slate-700 outline-none placeholder:text-slate-400;
}

.home-field-icon {
  @apply pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400;
}

.glass {
  @apply border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl;
}

.glass-panel {
  @apply border border-white/10 bg-white/5 backdrop-blur-lg shadow-xl;
}

.glass-card {
  @apply rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 shadow-xl backdrop-blur-xl;
}

.btn-primary {
  @apply rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50;
}

.btn-secondary {
  @apply rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50;
}

.btn-outline {
  @apply rounded-xl border-2 border-blue-500 bg-transparent px-5 py-3 font-medium text-blue-600 transition-all duration-300 hover:bg-blue-50;
}

.btn-danger {
  @apply rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-red-500;
}

.card {
  @apply rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6;
}

.card-hover {
  @apply cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg;
}

.input {
  @apply min-w-0 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100;
}

.label {
  @apply mb-2 block text-sm font-medium text-slate-600;
}

.badge {
  @apply inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em];
}

.badge-success {
  @apply inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600;
}

.badge-warning {
  @apply inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-600;
}

.badge-danger {
  @apply inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-600;
}

.badge-info {
  @apply inline-flex items-center justify-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-600;
}

.badge-ghost {
  @apply inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500;
}

.seat-available {
  @apply cursor-pointer rounded-xl border-2 border-slate-300 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:bg-blue-50;
}

.seat-selected {
  @apply scale-105 cursor-pointer rounded-xl border-2 border-blue-500 bg-blue-600 text-white shadow-lg transition-all duration-300;
}

.seat-booked {
  @apply cursor-not-allowed rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-400;
}

.seat-locked {
  @apply cursor-not-allowed rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-500;
}

.seat-driver {
  @apply cursor-default rounded-xl border-2 border-slate-200 bg-slate-100 opacity-60;
}

.seat-empty {
  @apply pointer-events-none opacity-0;
}

.section-title {
  @apply text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl lg:text-5xl;
}

.page-header {
  @apply mb-8 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between;
}

.surface-grid {
  @apply grid grid-cols-1 gap-6 lg:grid-cols-12;
}

.table-shell {
  @apply overflow-hidden rounded-2xl border border-slate-200 bg-white;
}

.table-scroll {
  @apply overflow-x-auto;
}

.mobile-stack {
  @apply flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between;
}

.eyebrow {
  @apply text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-500/70;
}

.text-gradient {
  @apply bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 7.5s ease-in-out infinite;
  animation-delay: 1.2s;
}

.animate-float-slow {
  animation: float 8s ease-in-out infinite;
}

.animate-float-fast {
  animation: float 4s ease-in-out infinite;
}

.pulse-ring {
  position: relative;
}

@keyframes pulse-ring {
  0% { transform: scale(0.9); opacity: 0.4; }
  100% { transform: scale(1.2); opacity: 0; }
}

.pulse-ring::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  background: currentColor;
  opacity: 0;
  animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.auth-input {
  @apply min-w-0 w-full rounded-xl border border-white/18 bg-white/6 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-slate-300 focus:border-blue-400/80 focus:bg-white/12 focus:ring-2 focus:ring-blue-500/20;
}

```

## src\app\layout.tsx

`$lang
import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import QueryProvider from '@/components/providers/QueryProvider'

export const metadata: Metadata = {
  title: 'Voyatra - Bus Booking Platform',
  description: 'Book bus tickets online with Voyatra. Fast, elegant and reliable bus booking for modern travelers.',
  keywords: 'Voyatra, bus booking, online tickets, seat selection, travel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: '',
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '12px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#1e293b' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#1e293b' },
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}

```

## src\app\page.tsx

`$lang
'use client'

import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Gift,
  Mail,
  MapPin,
  Percent,
  Phone,
  Search,
  Tag,
  Users,
} from 'lucide-react'
import Brand from '@/components/common/Brand'
import Navbar from '@/components/common/Navbar'

const popularRoutes = [
  { from: 'Mumbai', to: 'Pune', duration: '3h 30m', buses: '25+ buses', fare: '\u20B9450' },
  { from: 'Delhi', to: 'Agra', duration: '4h 15m', buses: '18+ buses', fare: '\u20B9380' },
  { from: 'Bangalore', to: 'Chennai', duration: '6h 45m', buses: '22+ buses', fare: '\u20B9720' },
  { from: 'Hyderabad', to: 'Bangalore', duration: '8h 30m', buses: '15+ buses', fare: '\u20B9850' },
  { from: 'Pune', to: 'Goa', duration: '10h 15m', buses: '12+ buses', fare: '\u20B9950' },
  { from: 'Ahmedabad', to: 'Mumbai', duration: '7h 20m', buses: '20+ buses', fare: '\u20B9650' },
]

const offers = [
  {
    code: 'FIRST50',
    title: '50% off on your first booking',
    badge: 'Up to \u20B9200',
    icon: Percent,
    tone: 'from-[#ffbf3c] to-[#f3a52e]',
  },
  {
    code: 'WEEKEND20',
    title: '20% off on weekend travels',
    badge: 'Up to \u20B9150',
    icon: Gift,
    tone: 'from-[#3a69c6] to-[#274da6]',
  },
  {
    code: 'SAVE100',
    title: '\u20B9100 off on bookings above \u20B9800',
    badge: 'Save \u20B9100',
    icon: Tag,
    tone: 'from-[#55c85f] to-[#35a947]',
  },
]

const socialLinks = [
  { label: 'Facebook', monogram: 'f' },
  { label: 'Twitter', monogram: 'x' },
  { label: 'Instagram', monogram: 'ig' },
  { label: 'LinkedIn', monogram: 'in' },
]

export default function HomePage() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1',
  })

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    if (!searchParams.from || !searchParams.to || !searchParams.date) return

    router.push(
      `/search?from=${encodeURIComponent(searchParams.from)}&to=${encodeURIComponent(searchParams.to)}&date=${searchParams.date}&passengers=${searchParams.passengers}`
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-b from-[#3969c5] to-[#2b4fa7] pb-24 pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(11,31,84,0.35),transparent_36%)]" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-16 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(57,105,197,0.08) 0%, rgba(25,48,103,0.08) 100%), url('/bus-banner.svg')",
            backgroundPosition: 'center bottom',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(43,79,167,0.18)_0%,rgba(43,79,167,0.12)_28%,rgba(24,46,99,0.34)_100%)]" />
        <div className="section-shell">
          <div className="relative mx-auto max-w-5xl text-center">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.35em] text-blue-100/80">
              Voyatra Travel Club
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[5rem] lg:leading-[1.05]">
              Book Your Bus Tickets Online
            </h1>
            <p className="mx-auto mt-6 max-w-4xl text-lg text-blue-50 sm:text-2xl">
              Safe, comfortable, and convenient bus travel across the country
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="relative z-10 mx-auto mt-14 grid max-w-6xl gap-5 rounded-[2rem] border border-white/60 bg-white px-6 py-7 shadow-[0_30px_80px_rgba(22,47,113,0.18)] lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end lg:px-10 lg:py-10"
          >
            <FieldLabel icon={<MapPin size={21} />} label="From">
              <div className="home-field-shell">
                <input
                  type="text"
                  placeholder="Select city"
                  value={searchParams.from}
                  onChange={(event) => setSearchParams((prev) => ({ ...prev, from: event.target.value }))}
                  className="home-field"
                  required
                />
                <ChevronDown size={18} className="home-field-icon" />
              </div>
            </FieldLabel>

            <FieldLabel icon={<MapPin size={21} />} label="To">
              <div className="home-field-shell">
                <input
                  type="text"
                  placeholder="Select city"
                  value={searchParams.to}
                  onChange={(event) => setSearchParams((prev) => ({ ...prev, to: event.target.value }))}
                  className="home-field"
                  required
                />
                <ChevronDown size={18} className="home-field-icon" />
              </div>
            </FieldLabel>

            <FieldLabel icon={<CalendarDays size={21} />} label="Date">
              <div className="home-field-shell">
                <input
                  type="date"
                  value={searchParams.date}
                  onChange={(event) => setSearchParams((prev) => ({ ...prev, date: event.target.value }))}
                  className="home-field"
                  required
                />
              </div>
            </FieldLabel>

            <FieldLabel icon={<Users size={21} />} label="Passengers">
              <div className="home-field-shell">
                <select
                  value={searchParams.passengers}
                  onChange={(event) => setSearchParams((prev) => ({ ...prev, passengers: event.target.value }))}
                  className="home-field appearance-none"
                >
                  <option value="1">Count</option>
                  <option value="1">1 Passenger</option>
                  <option value="2">2 Passengers</option>
                  <option value="3">3 Passengers</option>
                  <option value="4">4 Passengers</option>
                </select>
                <ChevronDown size={18} className="home-field-icon" />
              </div>
            </FieldLabel>

            <button
              type="submit"
              className="inline-flex min-h-16 items-center justify-center gap-3 rounded-[1.2rem] bg-[#f5b433] px-8 text-lg font-bold text-slate-950 shadow-[0_16px_30px_rgba(245,180,51,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#efaa1f]"
            >
              <Search size={22} />
              Search Buses
            </button>
          </form>
        </div>
      </section>

      <section id="about" className="bg-white py-24 sm:py-28">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Popular Routes</h2>
            <p className="mt-5 text-lg text-slate-500 sm:text-2xl">
              Book tickets for the most traveled routes across India
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {popularRoutes.map((route) => (
              <article
                key={`${route.from}-${route.to}`}
                className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#3969c5]/25 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-10"
              >
                <div className="flex flex-wrap items-center gap-3 text-[1.95rem] font-extrabold tracking-tight text-slate-900">
                  <span className="break-words">{route.from}</span>
                  <ArrowRight size={26} className="shrink-0 text-[#3969c5]" />
                  <span className="break-words">{route.to}</span>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-lg text-slate-500">
                  <div className="flex items-center gap-3">
                    <Clock3 size={26} className="shrink-0" />
                    <span>{route.duration}</span>
                  </div>
                  <span>{route.buses}</span>
                </div>

                <div className="mt-9 flex flex-wrap items-end justify-between gap-4">
                  <span className="text-4xl font-extrabold tracking-tight text-[#3969c5] sm:text-5xl">{route.fare}</span>
                  <span className="text-right text-xl text-slate-500 sm:text-2xl">Starting from</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfcff] py-24 sm:py-28">
        <div className="section-shell">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Special Offers &amp; Discounts
            </h2>
            <p className="mt-5 text-lg text-slate-500 sm:text-2xl">
              Save more on your bus bookings with our exclusive offers
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {offers.map((offer) => {
              const Icon = offer.icon

              return (
                <article
                  key={offer.code}
                  className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_20px_44px_rgba(15,23,42,0.08)]"
                >
                  <div className={`flex min-h-[290px] flex-col bg-gradient-to-br ${offer.tone} p-10 text-white`}>
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex h-18 w-18 items-center justify-center rounded-[1.35rem] bg-white/18">
                        <Icon size={34} />
                      </div>
                      <span className="rounded-full bg-white/18 px-5 py-2 text-xl font-semibold">
                        {offer.badge}
                      </span>
                    </div>

                    <h3 className="mt-10 text-2xl font-extrabold sm:text-[2.15rem]">{offer.code}</h3>
                    <p className="mt-4 max-w-[18ch] text-xl leading-[1.45] text-white/90">{offer.title}</p>
                  </div>

                  <div className="mt-auto border-t border-slate-100 p-10">
                    <button
                      type="button"
                      className="w-full rounded-[1.2rem] border border-[#3969c5] px-6 py-4 text-xl font-semibold text-[#3969c5] transition-colors hover:bg-blue-50"
                    >
                      Copy Code
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-[#232323] py-18 text-white sm:py-20">
        <div className="section-shell">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr_0.9fr_1.1fr]">
            <div>
              <Brand dark />
              <p className="mt-10 max-w-sm text-xl leading-relaxed text-slate-400">
                Voyatra is your trusted partner for safe and comfortable bus travel across India. Book with
                confidence and travel with ease.
              </p>
              <div className="mt-10 flex flex-wrap gap-6 text-slate-400">
                {socialLinks.map((item) => {
                  return (
                    <span
                      key={item.label}
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 text-sm font-semibold uppercase tracking-[0.08em] transition-colors hover:border-slate-500 hover:text-white"
                      aria-label={item.label}
                    >
                      {item.monogram}
                    </span>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold">Quick Links</h3>
              <div className="mt-10 grid gap-5 text-xl text-slate-400">
                <Link href="#about" className="transition-colors hover:text-white">About Us</Link>
                <Link href="#" className="transition-colors hover:text-white">How It Works</Link>
                <Link href="/search" className="transition-colors hover:text-white">Bus Operators</Link>
                <Link href="#" className="transition-colors hover:text-white">Terms &amp; Conditions</Link>
                <Link href="#" className="transition-colors hover:text-white">Privacy Policy</Link>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold">Support</h3>
              <div className="mt-10 grid gap-5 text-xl text-slate-400">
                <Link href="#" className="transition-colors hover:text-white">Help Center</Link>
                <Link href="#" className="transition-colors hover:text-white">Cancel Booking</Link>
                <Link href="#" className="transition-colors hover:text-white">Refund Policy</Link>
                <Link href="#" className="transition-colors hover:text-white">Track Your Bus</Link>
                <Link href="#" className="transition-colors hover:text-white">Live Chat</Link>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold">Contact Us</h3>
              <div className="mt-10 grid gap-7 text-xl text-slate-400">
                <div className="flex items-start gap-4">
                  <Phone size={28} className="mt-1 shrink-0 text-[#f5b433]" />
                  <span>+91 1800-123-4567</span>
                </div>
                <div className="flex items-start gap-4">
                  <Mail size={28} className="mt-1 shrink-0 text-[#f5b433]" />
                  <span>support@voyatra.com</span>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin size={28} className="mt-1 shrink-0 text-[#f5b433]" />
                  <span>123 Business District, Mumbai, Maharashtra 400001</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 border-t border-slate-700 pt-10 text-center text-lg text-slate-400">
            {'\u00A9'} 2024 Voyatra. All rights reserved. | Made with <span className="text-pink-400">&hearts;</span> in India
          </div>
        </div>
      </footer>
    </div>
  )
}

function FieldLabel({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-4 flex items-center gap-2 text-[1.05rem] font-semibold text-slate-700 sm:text-[1.1rem]">
        <span className="text-slate-500">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  )
}

```

## src\app\admin\layout.tsx

`$lang
'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
    '/admin': { title: 'Admin Overview', subtitle: 'Track operations, revenue, and fleet activity in one place.' },
    '/admin/buses': { title: 'Fleet Management', subtitle: 'Keep bus inventory, seat counts, and amenities up to date.' },
    '/admin/layouts': { title: 'Seat Layout Studio', subtitle: 'Design templates that stay consistent across your fleet.' },
    '/admin/routes': { title: 'Route Operations', subtitle: 'Organize corridors, stop patterns, and journey durations.' },
    '/admin/trips': { title: 'Trip Scheduling', subtitle: 'Manage departures, arrivals, fares, and live trip status.' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    const pageMeta = useMemo(() => {
        return (
            pageTitles[pathname] ?? {
                title: 'Admin Workspace',
                subtitle: 'Manage your bus booking platform with a cleaner operational view.',
            }
        )
    }, [pathname])

    return (
        <div className="min-h-screen bg-slate-950">
            <AdminSidebar
                collapsed={collapsed}
                mobileOpen={mobileOpen}
                onToggleCollapse={() => setCollapsed((value) => !value)}
                onCloseMobile={() => setMobileOpen(false)}
            />

            <main
                className={cn(
                    'min-h-screen transition-all duration-300',
                    collapsed ? 'lg:ml-20' : 'lg:ml-72'
                )}
            >
                <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                        >
                            <Menu size={18} />
                        </button>

                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300/70">
                                Operations
                            </p>
                            <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
                                {pageMeta.title}
                            </h1>
                            <p className="hidden text-sm text-slate-400 sm:block">
                                {pageMeta.subtitle}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    {children}
                </div>
            </main>
        </div>
    )
}

```

## src\app\admin\page.tsx

`$lang
'use client'

import { Card } from '@/components/common/Card'
import { Bus, Users, Ticket, TrendingUp, Calendar, MapPin, IndianRupee, ArrowUp, ArrowDown, MoreHorizontal, Eye, Download } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useState } from 'react'

const revenueData = [
    { name: 'Mon', revenue: 12000 },
    { name: 'Tue', revenue: 19000 },
    { name: 'Wed', revenue: 15000 },
    { name: 'Thu', revenue: 25000 },
    { name: 'Fri', revenue: 32000 },
    { name: 'Sat', revenue: 28000 },
    { name: 'Sun', revenue: 35000 },
]

const bookingData = [
    { name: 'AC Sleeper', value: 45, color: '#3b82f6' },
    { name: 'Non-AC Sleeper', value: 25, color: '#8b5cf6' },
    { name: 'AC Seater', value: 20, color: '#ec489a' },
    { name: 'Non-AC Seater', value: 10, color: '#f97316' },
]

export default function AdminDashboardPage() {
    const [timeframe, setTimeframe] = useState('week')

    const stats = [
        { 
            title: 'Total Bookings', 
            value: '1,248', 
            icon: Ticket, 
            trend: '+12%', 
            trendUp: true,
            color: 'text-blue-500', 
            bg: 'bg-blue-500/10',
            description: 'vs last month'
        },
        { 
            title: 'Total Revenue', 
            value: '₹4.2L', 
            icon: IndianRupee, 
            trend: '+8%', 
            trendUp: true,
            color: 'text-green-500', 
            bg: 'bg-green-500/10',
            description: 'vs last month'
        },
        { 
            title: 'Active Buses', 
            value: '42', 
            icon: Bus, 
            trend: '0%', 
            trendUp: false,
            color: 'text-amber-500', 
            bg: 'bg-amber-500/10',
            description: 'total fleet'
        },
        { 
            title: 'Registered Users', 
            value: '8,430', 
            icon: Users, 
            trend: '+24%', 
            trendUp: true,
            color: 'text-purple-500', 
            bg: 'bg-purple-500/10',
            description: 'active users'
        },
    ]

    const recentBookings = [
        { id: 'BK10012', user: 'Rahul Sharma', route: 'Delhi → Mumbai', amount: '₹1,450', status: 'confirmed', date: '2 mins ago', avatar: 'R' },
        { id: 'BK10013', user: 'Priya Patel', route: 'Bangalore → Pune', amount: '₹1,200', status: 'pending', date: '15 mins ago', avatar: 'P' },
        { id: 'BK10014', user: 'Amit Kumar', route: 'Chennai → Hyderabad', amount: '₹950', status: 'confirmed', date: '1 hour ago', avatar: 'A' },
        { id: 'BK10015', user: 'Sneha Sharma', route: 'Mumbai → Goa', amount: '₹2,500', status: 'cancelled', date: '2 hours ago', avatar: 'S' },
        { id: 'BK10016', user: 'Vikram Singh', route: 'Delhi → Jaipur', amount: '₹800', status: 'confirmed', date: '3 hours ago', avatar: 'V' },
    ]

    const upcomingTrips = [
        { time: '18:30', bus: 'Volvo AC Sleeper', route: 'Delhi → Jaipur', seats: 32, total: 40, status: 'boarding' },
        { time: '19:00', bus: 'Shamolly Express', route: 'Mumbai → Pune', seats: 28, total: 45, status: 'scheduled' },
        { time: '20:15', bus: 'Multi-Axle Volvo', route: 'Bangalore → Chennai', seats: 15, total: 44, status: 'scheduled' },
        { time: '21:30', bus: 'Non-AC Sleeper', route: 'Kolkata → Bhubaneswar', seats: 38, total: 50, status: 'scheduled' },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 p-8 border border-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />
                <div className="relative">
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome back, Admin!</h1>
                    <p className="text-slate-300 text-lg">Here's what's happening with your bus agency today.</p>
                    <div className="flex gap-2 mt-4">
                        <span className="badge-info flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="card group hover:scale-105 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <stat.icon size={24} className={stat.color} />
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-semibold ${stat.trendUp ? 'text-green-400' : 'text-slate-400'}`}>
                                {stat.trendUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
                            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                            <p className="text-xs text-slate-500">{stat.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Revenue Overview</h2>
                        <div className="flex gap-2">
                            {['day', 'week', 'month'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTimeframe(t)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                        timeframe === t 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-white/5 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip 
                                contentStyle={{ 
                                    background: '#1e293b', 
                                    border: '1px solid #334155', 
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Booking Distribution */}
                <div className="card">
                    <h2 className="text-lg font-bold text-white mb-6">Booking Distribution by Bus Type</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={bookingData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {bookingData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    background: '#1e293b', 
                                    border: '1px solid #334155', 
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {bookingData.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                                <span className="text-xs text-slate-400">{item.name}</span>
                                <span className="text-xs font-semibold text-white">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Bookings & Upcoming Trips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Recent Bookings</h2>
                        <button className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                            View all
                            <Eye size={14} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {recentBookings.map((booking, i) => (
                            <div 
                                key={i} 
                                className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {booking.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">{booking.user}</h4>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                            <MapPin size={12} /> {booking.route}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-white mb-1">{booking.amount}</span>
                                    <span className={`badge ${
                                        booking.status === 'confirmed' ? 'badge-success' : 
                                        booking.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                    }`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Today's Trips */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Today's Schedule</h2>
                        <button className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                            Manage
                            <MoreHorizontal size={14} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {upcomingTrips.map((trip, i) => (
                            <div key={i} className="relative p-4 rounded-xl bg-white/5 border border-white/10 overflow-hidden group hover:border-white/20 transition-all">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500" />
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                            <Bus size={14} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold text-white">{trip.time}</span>
                                            <p className="text-xs text-slate-400">{trip.bus}</p>
                                        </div>
                                    </div>
                                    <span className={`badge ${
                                        trip.status === 'boarding' ? 'badge-warning' : 'badge-info'
                                    }`}>
                                        {trip.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400 mb-3 ml-10">
                                    <span>{trip.route.split(' → ')[0]}</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent" />
                                    <span>{trip.route.split(' → ')[1]}</span>
                                </div>
                                <div className="flex items-center justify-between ml-10">
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                            style={{ width: `${(trip.seats / trip.total) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400 ml-3">
                                        {trip.seats}/{trip.total} seats
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="card group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Bus size={24} className="text-blue-400" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-white">Add New Bus</h3>
                            <p className="text-sm text-slate-400">Expand your fleet</p>
                        </div>
                    </div>
                </button>
                <button className="card group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calendar size={24} className="text-purple-400" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-white">Create Trip</h3>
                            <p className="text-sm text-slate-400">Schedule new journey</p>
                        </div>
                    </div>
                </button>
                <button className="card group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Download size={24} className="text-green-400" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-white">Export Report</h3>
                            <p className="text-sm text-slate-400">Download analytics</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    )
}

```

## src\app\admin\buses\page.tsx

`$lang
'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Bus as BusIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Bus } from '@/types/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AdminBusesPage() {
    const [searchTerm, setSearchTerm] = useState('')

    const { data: buses, isLoading, refetch } = useQuery({
        queryKey: ['buses'],
        queryFn: async () => {
            const supabase = createClient()
            const { data, error } = await supabase.from('buses').select('*').order('created_at', { ascending: false })
            if (error) throw error
            return data as Bus[]
        }
    })

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this bus?')) return
        try {
            const supabase = createClient()
            const { error } = await supabase.from('buses').delete().eq('id', id)
            if (error) throw error
            toast.success('Bus deleted successfully')
            refetch()
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete bus')
        }
    }

    const filteredBuses = buses?.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <h1 className="section-title">Bus Fleet Management</h1>
                    <p className="text-slate-400 mt-1">Manage all your agency buses</p>
                </div>
                <Link href="/admin/buses/new" className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    <span>Add New Bus</span>
                </Link>
            </div>

            <div className="card !p-0 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by name or reg number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900 border-b border-slate-800 text-sm font-semibold text-slate-400">
                                <th className="px-6 py-4">Bus Information</th>
                                <th className="px-6 py-4">Reg. Number</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-center">Total Seats</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading buses...</td>
                                </tr>
                            ) : filteredBuses?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <BusIcon size={40} className="text-slate-700" />
                                            <p>No buses found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBuses?.map((bus) => (
                                    <tr key={bus.id} className="hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-900/30 flex items-center justify-center">
                                                    <BusIcon size={18} className="text-blue-500" />
                                                </div>
                                                <span className="font-semibold text-white">{bus.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="badge badge-ghost font-mono uppercase tracking-wider">{bus.registration_number}</span>
                                        </td>
                                        <td className="px-6 py-4 capitalize text-slate-300">{bus.bus_type}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-white font-medium text-sm">
                                                {bus.total_seats}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/buses/${bus.id}/edit`} className="p-2 text-slate-400 hover:text-blue-400 bg-slate-800 hover:bg-blue-900/30 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button onClick={() => handleDelete(bus.id)} className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-red-900/30 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

```

## src\app\admin\buses\new\page.tsx

`$lang
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function NewBusPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '',
        registration_number: '',
        bus_type: 'AC Sleeper',
        total_seats: 40,
        amenities: 'WiFi, Charging Point, Water Bottle'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const supabase = createClient()

            const payload = {
                name: form.name,
                registration_number: form.registration_number.toUpperCase(),
                bus_type: form.bus_type,
                total_seats: Number(form.total_seats),
                amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean)
            }

            // @ts-expect-error Types for 'buses' table are missing
            const { error } = await supabase.from('buses').insert([payload])
            if (error) throw error

            toast.success('Bus added successfully')
            router.push('/admin/buses')
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || 'Failed to add bus')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/buses" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Add New Bus</h1>
                    <p className="text-slate-400 mt-1">Register a new vehicle to your fleet</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="label">Bus Name</label>
                        <input required type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Shamolly Express - 01" className="input" />
                    </div>
                    <div>
                        <label className="label">Registration Number</label>
                        <input required type="text" name="registration_number" value={form.registration_number} onChange={handleChange} placeholder="e.g. MH 01 AB 1234" className="input uppercase" />
                    </div>
                    <div>
                        <label className="label">Bus Type</label>
                        <select name="bus_type" value={form.bus_type} onChange={handleChange} className="input">
                            <option value="AC Sleeper">AC Sleeper</option>
                            <option value="Non-AC Sleeper">Non-AC Sleeper</option>
                            <option value="AC Seater">AC Seater</option>
                            <option value="Non-AC Seater">Non-AC Seater</option>
                            <option value="Multi-axle Volvo AC">Multi-axle Volvo AC</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Total Seats</label>
                        <input required type="number" name="total_seats" min="10" max="60" value={form.total_seats} onChange={handleChange} className="input" />
                    </div>
                </div>

                <div>
                    <label className="label">Amenities (Comma separated)</label>
                    <input type="text" name="amenities" value={form.amenities} onChange={handleChange} placeholder="WiFi, Blanket, Water Bottle..." className="input" />
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => router.push('/admin/buses')} className="btn-outline mr-3">Cancel</button>
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                        <Save size={18} />
                        <span>{loading ? 'Saving...' : 'Save Bus'}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}

```

## src\app\admin\layouts\page.tsx

`$lang
'use client'

import { useState } from 'react'
import { Plus, Search, Bus as BusIcon, LayoutGrid, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SeatLayoutsPage() {
    const [searchTerm, setSearchTerm] = useState('')

    const { data: layouts, isLoading, refetch } = useQuery({
        queryKey: ['seat_layouts'],
        queryFn: async () => {
            const supabase = createClient()
            const { data, error } = await supabase.from('seat_layouts').select(`*, buses(name)`).order('created_at', { ascending: false })
            if (error) throw error
            return data as any[]
        }
    })

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this layout?')) return
        try {
            const supabase = createClient()
            const { error } = await supabase.from('seat_layouts').delete().eq('id', id)
            if (error) throw error
            toast.success('Seat layout deleted successfully')
            refetch()
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete layout')
        }
    }

    const filteredLayouts = layouts?.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <h1 className="section-title">Seat Layouts</h1>
                    <p className="text-slate-400 mt-1">Manage seat configurations and templates</p>
                </div>
                <Link href="/admin/layouts/new" className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    <span>Design New Layout</span>
                </Link>
            </div>

            <div className="card !p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="relative max-w-sm w-full">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search layouts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900 border-b border-slate-800 text-sm font-semibold text-slate-400">
                                <th className="px-6 py-4">Layout Name</th>
                                <th className="px-6 py-4">Assigned To</th>
                                <th className="px-6 py-4">Grid Size</th>
                                <th className="px-6 py-4 text-center">Total Configured Seats</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading layouts...</td></tr>
                            ) : filteredLayouts?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <LayoutGrid size={40} className="text-slate-700" />
                                            <p>No seat layouts found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLayouts?.map((layout) => (
                                    <tr key={layout.id} className="hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-purple-900/30 flex items-center justify-center">
                                                    <LayoutGrid size={18} className="text-purple-500" />
                                                </div>
                                                <span className="font-semibold text-white">{layout.name}</span>
                                                {layout.is_template && <span className="badge badge-info text-[10px] ml-2">TEMPLATE</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {layout.buses?.name ? (
                                                <div className="flex items-center gap-2">
                                                    <BusIcon size={14} className="text-slate-500" />
                                                    <span>{layout.buses.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 italic">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="badge badge-ghost font-mono">
                                                {layout.layout_data.rows} x {layout.layout_data.cols}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-white font-medium">
                                            {layout.layout_data.seats.length}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDelete(layout.id)} className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-red-900/30 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

```

## src\app\admin\layouts\new\page.tsx

`$lang
'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, MousePointerClick, LayoutGrid, Grid3x3, Bus as BusIcon, Layers, Undo2, Redo2, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { SeatType, Seat, Bus } from '@/types/supabase'
import { useQuery } from '@tanstack/react-query'

export default function SeatLayoutDesigner() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [layoutName, setLayoutName] = useState('')
    const [selectedBusId, setSelectedBusId] = useState<string>('none')
    const [rows, setRows] = useState(10)
    const [cols, setCols] = useState(5)
    const [hasUpperDeck, setHasUpperDeck] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)
    const [history, setHistory] = useState<Record<string, SeatType>[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)

    const [gridState, setGridState] = useState<Record<string, SeatType>>({})

    const { data: buses } = useQuery({
        queryKey: ['buses_for_layout'],
        queryFn: async () => {
            const supabase = createClient()
            const { data } = await supabase.from('buses').select('id, name').order('name')
            return (data || []) as Pick<Bus, 'id' | 'name'>[]
        }
    })

    // Save to history
    const saveToHistory = (newState: Record<string, SeatType>) => {
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push({ ...newState })
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
    }

    // Undo/Redo
    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1)
            setGridState(history[historyIndex - 1])
        }
    }

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1)
            setGridState(history[historyIndex + 1])
        }
    }

    // Initialize/Reset grid
    const initializeGrid = () => {
        const newState: Record<string, SeatType> = {}
        const decks = hasUpperDeck ? ['lower', 'upper'] : ['lower']

        decks.forEach(deck => {
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const key = `${deck}-${r}-${c}`
                    // default aisle logic (middle col empty)
                    if (c === Math.floor(cols / 2)) newState[key] = 'empty'
                    else newState[key] = 'seater'
                }
            }
        })
        setGridState(newState)
        saveToHistory(newState)
        toast.success('Grid generated successfully!')
    }

    const toggleSeat = (deck: string, r: number, c: number) => {
        const key = `${deck}-${r}-${c}`
        const current = gridState[key] || 'empty'

        const nextType: Record<SeatType, SeatType> = {
            'seater': 'sleeper',
            'sleeper': 'empty',
            'empty': 'driver',
            'driver': 'seater'
        }

        const newState = { ...gridState, [key]: nextType[current] }
        setGridState(newState)
        saveToHistory(newState)
    }

    const generateSeatLabel = (deck: string, r: number, c: number) => {
        const rowChar = String.fromCharCode(65 + r)
        const deckPrefix = deck === 'upper' ? 'U-' : ''
        return `${deckPrefix}${rowChar}${c + 1}`
    }

    const getSeatColor = (type: SeatType) => {
        switch (type) {
            case 'seater': return 'from-slate-700 to-slate-800 border-slate-600'
            case 'sleeper': return 'from-blue-600/30 to-blue-700/20 border-blue-500/50'
            case 'driver': return 'from-amber-600/30 to-amber-700/20 border-amber-500/50'
            default: return 'from-transparent to-transparent border-dashed border-slate-700'
        }
    }

    const handleSave = async () => {
        if (!layoutName.trim()) { toast.error('Layout name is required'); return }

        setLoading(true)
        try {
            const seats: Seat[] = []

            Object.entries(gridState).forEach(([key, type]) => {
                if (type === 'empty') return

                const [deck, rStr, cStr] = key.split('-')
                const r = parseInt(rStr), c = parseInt(cStr)

                seats.push({
                    id: `${Date.now()}-${key}`,
                    label: generateSeatLabel(deck, r, c),
                    type,
                    row: r,
                    col: c,
                    deck: deck as 'lower' | 'upper'
                })
            })

            const payload = {
                name: layoutName,
                bus_id: selectedBusId === 'none' ? null : selectedBusId,
                is_template: selectedBusId === 'none',
                layout_data: { rows, cols, hasUpperDeck, seats }
            }

            const supabase = createClient()
            const { error } = await supabase.from('seat_layouts').insert([payload] as any)
            if (error) throw error

            toast.success('Layout saved successfully!')
            router.push('/admin/layouts')
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || 'Failed to save layout')
        } finally {
            setLoading(false)
        }
    }

    const renderDeck = (deck: 'lower' | 'upper') => (
        <div className="relative">
            {/* Deck Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                    <Layers size={18} className="text-blue-400" />
                    {deck} Deck
                </h3>
                <div className="text-xs text-slate-500">
                    {Object.values(gridState).filter((v, i) => {
                        const key = Object.keys(gridState)[i]
                        return key.startsWith(deck) && v !== 'empty'
                    }).length} seats
                </div>
            </div>

            {/* Bus Outline */}
            <div className="relative rounded-2xl border-2 border-white/20 p-4 bg-white/5">
                {/* Front Indicator */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                    FRONT
                </div>
                
                {/* Seat Grid */}
                <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: rows }).map((_, r) =>
                        Array.from({ length: cols }).map((_, c) => {
                            const type = gridState[`${deck}-${r}-${c}`] || 'empty'
                            const isAisle = c === Math.floor(cols / 2)

                            return (
                                <div
                                    key={`${deck}-${r}-${c}`}
                                    onClick={() => !previewMode && toggleSeat(deck, r, c)}
                                    className={`
                                        relative h-14 md:h-16 rounded-xl flex items-center justify-center font-bold text-xs select-none 
                                        transition-all duration-200 cursor-pointer group
                                        ${previewMode ? 'cursor-default' : 'hover:scale-105'}
                                        ${type === 'empty' ? 'bg-white/5 border-2 border-dashed border-white/20' : `bg-gradient-to-br ${getSeatColor(type)} border-2`}
                                        ${isAisle && type !== 'empty' ? 'col-span-1' : ''}
                                        ${type === 'sleeper' ? 'h-20 md:h-24 row-span-1' : ''}
                                    `}
                                    title={`Row ${r + 1}, Col ${c + 1} - ${type === 'empty' ? 'Empty Space' : type === 'driver' ? 'Driver Seat' : type === 'sleeper' ? 'Sleeper Berth' : 'Seater Seat'}`}
                                >
                                    {type !== 'empty' && (
                                        <>
                                            <span className={`${type === 'driver' ? 'text-[10px]' : 'text-xs font-bold'}`}>
                                                {type === 'driver' ? 'DRIVER' : generateSeatLabel(deck, r, c)}
                                            </span>
                                            {type === 'sleeper' && (
                                                <span className="absolute bottom-1 text-[8px] text-blue-300/50">SLEEPER</span>
                                            )}
                                        </>
                                    )}
                                    {type === 'empty' && (
                                        <span className="text-[10px] text-slate-600">aisle</span>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )

    const totalSeats = Object.values(gridState).filter(t => t !== 'empty').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/layouts" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                            <LayoutGrid className="text-blue-400" size={28} />
                            Seat Layout Designer
                        </h1>
                        <p className="text-slate-400 mt-1 flex items-center gap-2">
                            <Sparkles size={14} />
                            Click cells to toggle: Seater → Sleeper → Driver → Empty
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`p-2 rounded-xl transition-all ${previewMode ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400 hover:text-white'}`}
                        title={previewMode ? 'Exit Preview' : 'Preview Mode'}
                    >
                        {previewMode ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        className="p-2 rounded-xl bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Undo"
                    >
                        <Undo2 size={18} />
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                        className="p-2 rounded-xl bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Redo"
                    >
                        <Redo2 size={18} />
                    </button>
                    <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2">
                        <Save size={18} />
                        <span>{loading ? 'Saving...' : 'Save Layout'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Controls Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Grid3x3 size={18} className="text-blue-400" />
                            Configuration
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Layout Name</label>
                                <input 
                                    type="text" 
                                    value={layoutName} 
                                    onChange={(e) => setLayoutName(e.target.value)} 
                                    placeholder="e.g. Standard 40 Seater" 
                                    className="input" 
                                />
                            </div>

                            <div>
                                <label className="label">Assign to Bus (Optional)</label>
                                <select value={selectedBusId} onChange={(e) => setSelectedBusId(e.target.value)} className="input">
                                    <option value="none">Save as Template only</option>
                                    {buses?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Rows</label>
                                    <input type="number" min="5" max="25" value={rows} onChange={(e) => setRows(Number(e.target.value))} className="input" />
                                </div>
                                <div>
                                    <label className="label">Columns</label>
                                    <input type="number" min="3" max="7" value={cols} onChange={(e) => setCols(Number(e.target.value))} className="input" />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                <input
                                    type="checkbox"
                                    checked={hasUpperDeck}
                                    onChange={(e) => setHasUpperDeck(e.target.checked)}
                                    className="w-5 h-5 rounded border-white/30 text-blue-600 focus:ring-blue-600 bg-white/10"
                                />
                                <span className="text-sm font-medium text-white">Enable Upper Deck</span>
                            </label>

                            <button onClick={initializeGrid} className="btn-secondary w-full flex items-center justify-center gap-2">
                                <LayoutGrid size={16} />
                                Generate Grid
                            </button>

                            {totalSeats > 0 && (
                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Total Seats:</span>
                                        <span className="text-white font-bold">{totalSeats}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="card">
                        <h3 className="font-bold text-white mb-4">Legend</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600" />
                                <span className="text-slate-300">Seater</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-12 rounded-lg bg-gradient-to-br from-blue-600/30 to-blue-700/20 border-2 border-blue-500/50" />
                                <span className="text-slate-300">Sleeper</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600/30 to-amber-700/20 border-2 border-amber-500/50" />
                                <span className="text-slate-300">Driver</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg border-2 border-dashed border-white/30 bg-white/5" />
                                <span className="text-slate-300">Empty/Aisle</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Grid Preview */}
                <div className="lg:col-span-3 space-y-6">
                    {Object.keys(gridState).length === 0 ? (
                        <div className="card h-96 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 animate-float">
                                <LayoutGrid size={40} className="text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to Design</h3>
                            <p className="text-slate-400 max-w-sm">
                                Configure your grid dimensions and click "Generate Grid" to start creating your perfect seat layout.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {renderDeck('lower')}
                            {hasUpperDeck && renderDeck('upper')}
                            
                            {previewMode && (
                                <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                    <AlertCircle size={16} className="text-blue-400" />
                                    <p className="text-sm text-blue-400">Preview Mode - Clicking on seats is disabled</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

```

## src\app\admin\routes\page.tsx

`$lang
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, MapPin, Navigation, Edit2, Trash2, Route as RouteIcon } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminRoutesPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const supabase = createClient()

    const { data: routes, isLoading, refetch } = useQuery({
        queryKey: ['admin-routes'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('routes')
                .select('*')
                .order('created_at', { ascending: false })
            if (error) throw error
            return data as any[]
        }
    })

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this route?')) return
        
        try {
            const { error } = await supabase
                .from('routes')
                .delete()
                .eq('id', id)
            
            if (error) throw error
            toast.success('Route deleted successfully')
            refetch()
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete route')
        }
    }

    const filteredRoutes = routes?.filter(route => 
        route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.destination.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <div className="eyebrow">Network Planning</div>
                    <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold text-white">
                        <RouteIcon className="text-blue-500" />
                        Route Management
                    </h1>
                    <p className="mt-1 text-slate-400">Manage bus routes, stop patterns, and travel times.</p>
                </div>
                <Link href="/admin/routes/new" className="btn-primary inline-flex items-center gap-2">
                    <Plus size={18} />
                    <span>Add New Route</span>
                </Link>
            </div>

            <div className="card p-4">
                <div className="relative max-w-xl">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by origin or destination..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input border-slate-700 bg-slate-800/50 pl-10"
                    />
                </div>
            </div>

            <div className="table-shell">
                <div className="table-scroll">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/50 border-b border-slate-800">
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Route Details</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Distance</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Est. Duration</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Stops</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="px-6 py-4">
                                                    <div className="h-12 bg-slate-800/50 rounded-lg"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredRoutes?.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                No routes found matching your search.
                                            </td>
                                        </tr>
                                    ) : filteredRoutes?.map((route) => (
                                        <tr key={route.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
                                                        <Navigation size={18} className="text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 text-white font-medium">
                                                            <span>{route.origin}</span>
                                                            <span className="text-slate-500">→</span>
                                                            <span>{route.destination}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <MapPin size={12} />
                                                            <span>via {route.via_cities?.join(', ') || 'Direct'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 font-medium">
                                                {route.distance_km} KM
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 font-medium">
                                                {route.estimated_duration}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400">
                                                    {route.via_cities?.length || 0} Stops
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(route.id)}
                                                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                </div>
            </div>
        </div>
    )
}

```

## src\app\admin\trips\page.tsx

`$lang
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Bus, MapPin, Edit2, Trash2, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminTripsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const supabase = createClient()

    const { data: trips, isLoading, refetch } = useQuery({
        queryKey: ['admin-trips'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('trips')
                .select(`
                    *,
                    route:routes(*),
                    bus:buses(*)
                `)
                .order('departure_time', { ascending: true })
            if (error) throw error
            return data as any[]
        }
    })

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this trip mapping?')) return
        
        try {
            const { error } = await supabase
                .from('trips')
                .delete()
                .eq('id', id)
            
            if (error) throw error
            toast.success('Trip deleted successfully')
            refetch()
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete trip')
        }
    }

    const filteredTrips = trips?.filter(trip => 
        trip.bus?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.route?.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.route?.destination.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'ongoing': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20'
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        }
    }

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <div className="eyebrow">Departure Control</div>
                    <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold text-white">
                        <CalendarDays className="text-blue-500" />
                        Trip Scheduling
                    </h1>
                    <p className="mt-1 text-slate-400">Schedule departures, manage fares, and monitor trip status.</p>
                </div>
                <Link href="/admin/trips/new" className="btn-primary inline-flex items-center gap-2">
                    <Plus size={18} />
                    <span>Schedule New Trip</span>
                </Link>
            </div>

            <div className="card p-4">
                <div className="relative max-w-xl">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by bus name or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input border-slate-700 bg-slate-800/50 pl-10"
                    />
                </div>
            </div>

            <div className="table-shell">
                <div className="table-scroll">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/50 border-b border-slate-800">
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Bus & Route</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Departure</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Arrival</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fare</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={6} className="px-6 py-4">
                                                    <div className="h-12 bg-slate-800/50 rounded-lg"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredTrips?.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                No trips scheduled for the current selection.
                                            </td>
                                        </tr>
                                    ) : filteredTrips?.map((trip) => (
                                        <tr key={trip.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-white font-medium">
                                                        <Bus size={14} className="text-slate-500" />
                                                        <span>{trip.bus?.name}</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                            {trip.bus?.bus_type}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        <span>{trip.route?.origin} → {trip.route?.destination}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-200 text-sm font-medium">
                                                        {new Date(trip.departure_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    <span className="text-slate-500 text-xs mt-0.5">
                                                        {new Date(trip.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-200 text-sm font-medium">
                                                        {new Date(trip.arrival_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    <span className="text-slate-500 text-xs mt-0.5">
                                                        {new Date(trip.arrival_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white font-bold">
                                                ₹{trip.base_price.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(trip.status)}`}>
                                                    {trip.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(trip.id)}
                                                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                </div>
            </div>
        </div>
    )
}

```

## src\app\auth\login\page.tsx

`$lang
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Clock3, Eye, EyeOff, Lock, Mail, Shield, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import Brand from '@/components/common/Brand'

const loginFeatures = [
    { icon: Shield, title: 'Secure Access', desc: 'Protected account and traveler data' },
    { icon: Sparkles, title: 'Smart Travel', desc: 'A faster and cleaner booking experience' },
    { icon: Clock3, title: 'Quick Checkout', desc: 'Open bookings and manage tickets instantly' },
]

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)
    const router = useRouter()
    const { setUser } = useAuthStore()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            toast.error('Please fill all fields')
            return
        }
        setLoading(true)
        try {
            const supabase = createClient()
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error

            const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single()
            if (profile) setUser(profile as any)

            toast.success('Welcome back!')
            const role = (profile as any)?.role
            if (role === 'admin' || role === 'agent') router.push('/admin')
            else router.push('/')
        } catch (err: any) {
            toast.error(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#0c1530] to-slate-950 xl:h-dvh">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl animate-float" />
                <div className="absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl animate-float-delayed" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-30" />
            </div>

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-5 sm:py-8 xl:h-dvh xl:min-h-0 xl:overflow-hidden">
                <div className="grid w-full max-w-7xl gap-6 xl:h-full xl:max-h-dvh xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
                    <section className="hidden xl:flex xl:h-full xl:flex-col xl:justify-between xl:py-4">
                        <div>
                            <Brand dark href="/" />
                            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.34em] text-blue-100/75">
                                Welcome back
                            </p>
                            <h1 className="mt-4 max-w-3xl text-[3.7rem] font-extrabold leading-[0.98] text-white 2xl:text-[4.4rem]">
                                Sign in and continue your journey.
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 2xl:text-lg">
                                Access bookings, manage tickets, and continue your travel experience with Voyatra.
                            </p>
                        </div>

                        <div className="mt-5 grid max-w-3xl gap-3">
                            {loginFeatures.map((feature) => {
                                const Icon = feature.icon
                                return (
                                    <div
                                        key={feature.title}
                                        className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm transition-colors hover:bg-white/10"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-300">
                                                <Icon size={17} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                                                <p className="mt-1 text-xs leading-5 text-slate-400">{feature.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    <section className="mx-auto flex w-full max-w-xl items-center justify-center xl:h-full xl:max-w-none xl:justify-end">
                        <div className="relative w-full max-w-xl 2xl:max-w-[42rem]">
                            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-cyan-500/30 blur-2xl" />
                            <div className="relative rounded-[1.5rem] border border-white/15 bg-[linear-gradient(180deg,rgba(69,85,132,0.92)_0%,rgba(58,73,118,0.94)_100%)] p-4 shadow-2xl backdrop-blur-xl sm:rounded-[2rem] sm:p-5 xl:overflow-hidden">
                                <div className="mb-4 flex justify-end">
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/15 px-3 py-2 text-xs text-blue-50 transition-all hover:bg-blue-500/25 hover:text-white sm:px-4 sm:text-sm"
                                    >
                                        <ArrowLeft size={18} />
                                        Back Home
                                    </Link>
                                </div>

                                <div className="mb-4 text-center">
                                  
                                    <h2 className="text-[2rem] font-bold text-white sm:text-3xl">Welcome back</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
                                        Sign in to your Voyatra account and pick up where you left off.
                                    </p>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-3">
                                    <AuthField label="Email Address" icon={Mail} focused={focusedField === 'email'} value={email}>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="you@example.com"
                                            className="auth-input"
                                            style={{ paddingLeft: "3.25rem" }}
                                            required
                                        />
                                    </AuthField>

                                    <AuthField label="Password" icon={Lock} focused={focusedField === 'password'} value={password}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="********"
                                            className="auth-input"
                                            style={{ paddingLeft: "3.25rem", paddingRight: "3.25rem" }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </AuthField>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3.5 sm:text-base"
                                    >
                                        {loading ? (
                                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        ) : (
                                            <>
                                                <span>Sign In</span>
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-sm text-slate-300">
                                        Don&apos;t have an account?{' '}
                                        <Link href="/auth/register" className="font-semibold text-blue-300 hover:text-white">
                                            Create one
                                        </Link>
                                    </p>
                                </form>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

function AuthField({
    label,
    icon: Icon,
    children,
    focused,
    value,
}: {
    label: string
    icon: typeof Mail
    children: React.ReactNode
    focused: boolean
    value: string
}) {
    return (
        <div className="group">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                <Icon size={14} className="text-blue-300" />
                {label}
            </label>
            <div className={`relative transition-all duration-300 ${focused ? 'scale-[1.01]' : ''}`}>
                <Icon
                    size={16}
                    className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${
                        focused || value ? 'text-blue-300' : 'text-slate-500'
                    }`}
                />
                {children}
            </div>
        </div>
    )
}

```

## src\app\auth\register\page.tsx

`$lang
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock3,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Shield,
  Sparkles,
  User,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store";
import toast from "react-hot-toast";
import Brand from "@/components/common/Brand";

const featureCards = [
  {
    icon: Shield,
    title: "Secure Booking",
    desc: "Protected payments and account safety",
  },
  {
    icon: CreditCard,
    title: "Best Prices",
    desc: "Competitive fares on every major route",
  },
  {
    icon: Clock3,
    title: "24/7 Support",
    desc: "Travel help whenever you need it",
  },
  {
    icon: Calendar,
    title: "Easy Changes",
    desc: "Flexible booking and trip management",
  },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const password = form.password;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [form.password]);

  useEffect(() => {
    if (form.confirm) setPasswordsMatch(form.password === form.confirm);
    else setPasswordsMatch(true);
  }, [form.password, form.confirm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.full_name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    if (!form.password) {
      toast.error("Please enter a password");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Please accept the terms to continue");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            phone: form.phone,
          },
        },
      });
      if (error) throw error;

      if (data.user) {
        // @ts-expect-error Supabase generator missing users table type
        await supabase.from("users").insert({
          id: data.user.id,
          email: form.email,
          full_name: form.full_name,
          phone: form.phone,
          role: "customer",
        });
        setUser({
          id: data.user.id,
          email: form.email,
          full_name: form.full_name,
          phone: form.phone,
          role: "customer",
          created_at: new Date().toISOString(),
        });
      }

      toast.success("Account created successfully! Welcome aboard!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-slate-700";
    if (passwordStrength === 1) return "bg-rose-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-amber-400";
    return "bg-emerald-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "No password";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#0c1530] to-slate-950 xl:h-dvh">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl animate-float" />
        <div className="absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl animate-float-delayed" />
        <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-30" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-5 sm:py-8 xl:h-dvh xl:min-h-0 xl:overflow-hidden">
        <div className="grid w-full max-w-7xl gap-6 xl:h-full xl:max-h-dvh xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
          <section className="hidden xl:flex xl:h-full xl:flex-col xl:justify-between xl:py-4">
            <div>
              <Brand dark href="/" />
              <p className="mt-12 text-sm font-semibold uppercase tracking-[0.34em] text-blue-100/75">
                Your next trip is waiting
              </p>
              <h1 className="mt-4 max-w-3xl text-[3.8rem] font-extrabold leading-[0.98] text-white 2xl:text-[4.6rem]">
                Create your account and start booking smarter.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 2xl:text-lg">
                Join Voyatra to save routes, manage tickets, and book with a
                faster, cleaner travel experience.
              </p>
            </div>

            <div className="mt-5 grid max-w-3xl grid-cols-2 gap-3">
              {featureCards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm transition-colors hover:bg-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-300">
                        <Icon size={17} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {feature.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-xl items-center justify-center xl:h-full xl:max-w-none xl:justify-end">
            <div className="relative w-full max-w-xl 2xl:max-w-[42rem]">
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-cyan-500/30 blur-2xl" />
              <div className="relative rounded-[1.5rem] border border-white/15 bg-[linear-gradient(180deg,rgba(69,85,132,0.92)_0%,rgba(58,73,118,0.94)_100%)] p-4 shadow-2xl backdrop-blur-xl sm:rounded-[2rem] sm:p-5 xl:overflow-hidden">
                <div className="mb-4 flex justify-end">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/15 px-3 py-2 text-xs text-blue-50 transition-all hover:bg-blue-500/25 hover:text-white sm:px-4 sm:text-sm"
                  >
                    <ArrowLeft size={18} />
                    Back Home
                  </Link>
                </div>

                <div className="mb-4 text-center">
                  <h2 className="text-[2rem] font-bold text-white sm:text-3xl">
                    Create account
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
                    Join Voyatra and book your first trip with a cleaner, faster
                    experience.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-3">
                  <AuthField
                    label="Full Name"
                    icon={User}
                    value={form.full_name}
                    focused={focusedField === "full_name"}
                  >
                    <input
                      name="full_name"
                      type="text"
                      value={form.full_name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("full_name")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="John Doe"
                      className="auth-input"
                      style={{ paddingLeft: "3.25rem" }}
                      required
                    />
                  </AuthField>

                  <AuthField
                    label="Email Address"
                    icon={Mail}
                    value={form.email}
                    focused={focusedField === "email"}
                  >
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="you@example.com"
                      className="auth-input"
                      style={{ paddingLeft: "3.25rem" }}
                      required
                    />
                  </AuthField>

                  <AuthField
                    label="Phone (optional)"
                    icon={Phone}
                    value={form.phone}
                    focused={focusedField === "phone"}
                  >
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="+91 00000 00000"
                      className="auth-input"
                      style={{ paddingLeft: "3.25rem" }}
                    />
                  </AuthField>

                  <div>
                    <AuthField
                      label="Password"
                      icon={Lock}
                      value={form.password}
                      focused={focusedField === "password"}
                    >
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="********"
                        className="auth-input"
                        style={{ paddingLeft: "3.25rem", paddingRight: "3.25rem" }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </AuthField>

                    {form.password ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                              style={{
                                width: `${(passwordStrength / 4) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
                          <Requirement
                            ok={form.password.length >= 6}
                            text="6+ chars"
                          />
                          <Requirement
                            ok={
                              /[A-Z]/.test(form.password) &&
                              /[a-z]/.test(form.password)
                            }
                            text="Upper & lower"
                          />
                          <Requirement
                            ok={/[0-9]/.test(form.password)}
                            text="Number"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <AuthField
                      label="Confirm Password"
                      icon={Lock}
                      value={form.confirm}
                      focused={focusedField === "confirm"}
                    >
                      <input
                        name="confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirm}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("confirm")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="********"
                        className="auth-input"
                        style={{ paddingLeft: "3.25rem", paddingRight: "3.25rem" }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </AuthField>

                    {form.confirm ? (
                      <p
                        className={`mt-2 inline-flex items-center gap-1 text-xs ${passwordsMatch ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {passwordsMatch ? (
                          <CheckCircle size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {passwordsMatch
                          ? "Passwords match"
                          : "Passwords do not match"}
                      </p>
                    ) : null}
                  </div>

                  <label className="flex items-start gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500"
                    />
                    <span>
                      By creating an account, you agree to our terms and booking
                      policies.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={
                      loading || (form.confirm !== "" && !passwordsMatch)
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3.5 sm:text-base"
                  >
                    {loading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-slate-300">
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="font-semibold text-blue-300 hover:text-white"
                    >
                      Sign in
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Requirement({ ok, text }: { ok: boolean; text: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {ok ? (
        <CheckCircle size={11} className="text-emerald-400" />
      ) : (
        <XCircle size={11} className="text-slate-500" />
      )}
      {text}
    </span>
  );
}

function AuthField({
  label,
  icon: Icon,
  children,
  focused,
  value,
}: {
  label: string;
  icon: typeof User;
  children: React.ReactNode;
  focused: boolean;
  value: string;
}) {
  return (
    <div className="group">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
        <Icon size={14} className="text-blue-300" />
        {label}
      </label>
      <div
        className={`relative transition-all duration-300 ${focused ? "scale-[1.01]" : ""}`}
      >
        <Icon
          size={16}
          className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${
            focused || value ? "text-blue-300" : "text-slate-500"
          }`}
        />
        {children}
      </div>
    </div>
  );
}

```

## src\app\book\[id]\page.tsx

`$lang
'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore, useBookingStore } from '@/store'
import { Bus, MapPin, Clock, Calendar, ArrowLeft, Users, Wifi, Coffee, Power, Shield, Luggage, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/common/Navbar'
import toast from 'react-hot-toast'
import type { Trip, Seat, SeatLayoutData } from '@/types/supabase'

export default function SeatSelectionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { user } = useAuthStore()
    const { selectedSeats, toggleSeat, clearSeats, setTripId } = useBookingStore()
    const [loading, setLoading] = useState(false)
    const [selectedDeck, setSelectedDeck] = useState<'lower' | 'upper'>('lower')
    const [layout, setLayout] = useState<SeatLayoutData | null>(null)

    // Fetch trip details
    const { data: trip, isLoading: tripLoading } = useQuery({
        queryKey: ['trip', id],
        queryFn: async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('trips')
                .select(`
                    *,
                    route:routes(*),
                    bus:buses(*),
                    seat_layout:seat_layouts(*)
                `)
                .eq('id', id)
                .single()
            if (error) throw error
            return data as Trip & { route: any; bus: any; seat_layout: any }
        }
    })

    // Set trip ID in store
    useEffect(() => {
        setTripId(id)
        return () => clearSeats()
    }, [id, setTripId, clearSeats])

    // Load seat layout
    useEffect(() => {
        if (trip?.seat_layout?.layout_data) {
            setLayout(trip.seat_layout.layout_data)
        }
    }, [trip])

    const handleProceedToCheckout = () => {
        if (!user) {
            toast.error('Please login to continue booking')
            router.push(`/auth/login?redirect=/book/${id}`)
            return
        }
        if (selectedSeats.length === 0) {
            toast.error('Please select at least one seat')
            return
        }
        router.push(`/checkout/${id}`)
    }

    const getAmenityIcon = (amenity: string) => {
        const icons: Record<string, any> = {
            'WiFi': Wifi,
            'Charging Point': Power,
            'Water Bottle': Coffee,
            'Blanket': Shield,
            'Luggage Storage': Luggage
        }
        const Icon = icons[amenity] || Shield
        return <Icon size={14} className="text-slate-500" />
    }

    if (tripLoading) {
        return (
            <div className="min-h-screen bg-slate-950">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        )
    }

    if (!trip) {
        return (
            <div className="min-h-screen bg-slate-950">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-24 text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Trip not found</h1>
                    <Link href="/search" className="btn-primary">Search Buses</Link>
                </div>
            </div>
        )
    }

    const seatMatrix = layout?.seats || []
    const hasUpperDeck = layout?.hasUpperDeck || false
    const lowerSeats = seatMatrix.filter(s => s.deck === 'lower')
    const upperSeats = seatMatrix.filter(s => s.deck === 'upper')
    const cols = layout?.cols || 4

    const renderSeat = (seat: Seat) => {
        const isSelected = selectedSeats.some(s => s.id === seat.id)
        const isBooked = false // TODO: Check if seat is already booked
        const isDriver = seat.type === 'driver'
        const isEmpty = seat.type === 'empty'

        if (isEmpty) {
            return <div key={seat.id} className="seat-empty h-12 md:h-16" />
        }

        if (isDriver) {
            return (
                <div key={seat.id} className="seat-driver h-12 md:h-16 flex items-center justify-center text-[10px] font-bold">
                    DRIVER
                </div>
            )
        }

        return (
            <button
                key={seat.id}
                onClick={() => !isBooked && toggleSeat(seat)}
                disabled={isBooked}
                className={`
                    relative h-12 md:h-16 rounded-xl flex flex-col items-center justify-center font-semibold text-xs transition-all duration-200
                    ${isSelected 
                        ? 'seat-selected bg-blue-600 text-white shadow-lg scale-105' 
                        : isBooked 
                            ? 'seat-booked bg-slate-800 text-slate-600 cursor-not-allowed' 
                            : 'seat-available bg-slate-800/80 text-slate-300 hover:bg-blue-500/20 hover:text-white hover:border-blue-400'
                    }
                `}
            >
                <span className="text-sm font-bold">{seat.label}</span>
                <span className="text-[10px] opacity-75">{seat.type === 'sleeper' ? 'Sleeper' : 'Seater'}</span>
            </button>
        )
    }

    const renderDeckGrid = (seats: Seat[], deckName: string) => {
        // Group by row
        const rows: { [key: number]: Seat[] } = {}
        seats.forEach(seat => {
            if (!rows[seat.row]) rows[seat.row] = []
            rows[seat.row][seat.col] = seat
        })

        return (
            <div className="space-y-3">
                <h3 className="text-lg font-bold text-white mb-4 capitalize flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {deckName} Deck
                </h3>
                <div className="relative">
                    {/* Bus Front Indicator */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-slate-500">
                        Front of Bus →
                    </div>
                    <div 
                        className="grid gap-2 p-4 bg-slate-900/50 rounded-2xl border border-slate-800"
                        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                    >
                        {Object.keys(rows).sort((a,b) => Number(a) - Number(b)).map(rowNum => (
                            rows[Number(rowNum)].map((seat, idx) => (
                                seat ? renderSeat(seat) : <div key={`empty-${rowNum}-${idx}`} className="h-12 md:h-16" />
                            ))
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            
            <main className="pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Link href="/search" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                        <ArrowLeft size={18} />
                        <span>Back to search results</span>
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Seat Map Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="card">
                                <h2 className="text-xl font-bold text-white mb-4">Select Your Seats</h2>
                                
                                {/* Deck Toggle */}
                                {hasUpperDeck && (
                                    <div className="flex gap-2 mb-6">
                                        <button
                                            onClick={() => setSelectedDeck('lower')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                selectedDeck === 'lower' 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            Lower Deck
                                        </button>
                                        <button
                                            onClick={() => setSelectedDeck('upper')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                selectedDeck === 'upper' 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            Upper Deck
                                        </button>
                                    </div>
                                )}

                                {selectedDeck === 'lower' && renderDeckGrid(lowerSeats, 'Lower')}
                                {hasUpperDeck && selectedDeck === 'upper' && renderDeckGrid(upperSeats, 'Upper')}

                                {/* Legend */}
                                <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 border-2 border-slate-600"></div>
                                        <span className="text-xs text-slate-400">Available</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-600 border-2 border-blue-400"></div>
                                        <span className="text-xs text-slate-400">Selected</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-slate-700 border-2 border-slate-600"></div>
                                        <span className="text-xs text-slate-400">Booked</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-amber-900/30 border-2 border-amber-700/50"></div>
                                        <span className="text-xs text-slate-400">Driver</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Summary */}
                        <div className="space-y-6">
                            {/* Trip Details */}
                            <div className="card">
                                <h3 className="font-bold text-white mb-4">Trip Details</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Bus size={16} />
                                            <span className="text-sm">Bus</span>
                                        </div>
                                        <span className="text-white font-medium">{trip.bus?.name}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin size={16} />
                                            <span className="text-sm">Route</span>
                                        </div>
                                        <span className="text-white font-medium">
                                            {trip.route?.origin} → {trip.route?.destination}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar size={16} />
                                            <span className="text-sm">Date</span>
                                        </div>
                                        <span className="text-white font-medium">
                                            {new Date(trip.departure_time).toLocaleDateString('en-IN')}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={16} />
                                            <span className="text-sm">Time</span>
                                        </div>
                                        <span className="text-white font-medium">
                                            {new Date(trip.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - 
                                            {new Date(trip.arrival_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Amenities */}
                            {trip.bus?.amenities && trip.bus.amenities.length > 0 && (
                                <div className="card">
                                    <h3 className="font-bold text-white mb-3">Amenities</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {trip.bus.amenities.map((amenity: string) => (
                                            <div key={amenity} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm">
                                                {getAmenityIcon(amenity)}
                                                <span>{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Selected Seats */}
                            <div className="card">
                                <h3 className="font-bold text-white mb-4">Selected Seats</h3>
                                {selectedSeats.length === 0 ? (
                                    <p className="text-slate-400 text-sm text-center py-8">
                                        No seats selected yet. Click on available seats to add them.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSeats.map(seat => (
                                                <div key={seat.id} className="px-3 py-2 rounded-lg bg-blue-600/20 text-blue-400 text-sm font-medium">
                                                    {seat.label}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                                            <span className="text-slate-400">Total Amount</span>
                                            <span className="text-2xl font-bold text-white">
                                                ₹{(selectedSeats.length * trip.base_price).toLocaleString()}
                                            </span>
                                        </div>
                                        
                                        <button
                                            onClick={handleProceedToCheckout}
                                            disabled={loading}
                                            className="btn-primary w-full flex items-center justify-center gap-2"
                                        >
                                            <span>Proceed to Checkout</span>
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

```

## src\app\booking\success\page.tsx

`$lang
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Download, Mail, Printer, Ticket, Bus, ArrowRight } from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import { QRCodeSVG } from 'qrcode.react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

import { Suspense } from 'react'

function BookingSuccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const bookingId = searchParams.get('booking_id')
    
    const { data: booking, isLoading } = useQuery({
        queryKey: ['booking', bookingId],
        queryFn: async () => {
            if (!bookingId) throw new Error('No booking ID')
            const supabase = createClient()
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    trip:trips(
                        *,
                        route:routes(*),
                        bus:buses(*)
                    ),
                    booking_seats(*)
                `)
                .eq('id', bookingId)
                .single()
            if (error) throw error
            return data as any
        },
        enabled: !!bookingId
    })

    useEffect(() => {
        if (!bookingId && !isLoading) {
            router.push('/dashboard/bookings')
        }
    }, [bookingId, router, isLoading])

    if (isLoading || !booking) {
        return (
            <div className="min-h-screen bg-slate-950">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        )
    }

    const qrData = JSON.stringify({
        booking_id: booking.id,
        trip_id: booking.trip_id,
        seats: booking.booking_seats?.map((s: any) => s.seat_label)
    })

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            
            <main className="pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
                            <CheckCircle size={40} className="text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
                        <p className="text-slate-400">
                            Your booking has been successfully confirmed. Booking ID: {booking.id}
                        </p>
                    </div>

                    {/* E-Ticket Card */}
                    <div className="card overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Ticket size={20} className="text-white" />
                                    <span className="text-white font-semibold">E-TICKET</span>
                                </div>
                                <span className="text-white/80 text-sm">Shamolly Transit</span>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {/* Trip Info */}
                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6 pb-6 border-b border-slate-800">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">From</p>
                                    <p className="text-xl font-bold text-white">{booking.trip?.route?.origin}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-[2px] bg-slate-700"></div>
                                    <Bus size={16} className="text-slate-500" />
                                    <div className="w-12 h-[2px] bg-slate-700"></div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 mb-1">To</p>
                                    <p className="text-xl font-bold text-white">{booking.trip?.route?.destination}</p>
                                </div>
                            </div>
                            
                            {/* Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <p className="text-xs text-slate-500">Departure Date</p>
                                    <p className="text-sm font-medium text-white">
                                        {new Date(booking.trip?.departure_time).toLocaleDateString('en-IN')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Departure Time</p>
                                    <p className="text-sm font-medium text-white">
                                        {new Date(booking.trip?.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Bus Name</p>
                                    <p className="text-sm font-medium text-white">{booking.trip?.bus?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Bus Type</p>
                                    <p className="text-sm font-medium text-white">{booking.trip?.bus?.bus_type}</p>
                                </div>
                            </div>
                            
                            {/* Seats */}
                            <div className="mb-6 p-4 rounded-xl bg-slate-800/50">
                                <p className="text-xs text-slate-500 mb-2">Seat Numbers</p>
                                <div className="flex flex-wrap gap-2">
                                    {booking.booking_seats?.map((seat: any) => (
                                        <span key={seat.id} className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 font-medium">
                                            {seat.seat_label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* QR Code */}
                            <div className="flex flex-col items-center pt-4 border-t border-slate-800">
                                <div className="bg-white p-4 rounded-xl mb-3">
                                    <QRCodeSVG value={qrData} size={160} level="Q" />
                                </div>
                                <p className="text-xs text-slate-500 text-center">
                                    Show this QR code at the time of boarding. The conductor will scan to verify your ticket.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button className="btn-secondary flex items-center gap-2">
                            <Download size={18} />
                            <span>Download Ticket</span>
                        </button>
                        <button className="btn-secondary flex items-center gap-2">
                            <Mail size={18} />
                            <span>Email Ticket</span>
                        </button>
                        <button className="btn-secondary flex items-center gap-2">
                            <Printer size={18} />
                            <span>Print Ticket</span>
                        </button>
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex flex-wrap gap-4 justify-center mt-8">
                        <Link href="/dashboard/bookings" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                            <span>View All Bookings</span>
                            <ArrowRight size={14} />
                        </Link>
                        <Link href="/search" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                            <span>Book Another Trip</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        }>
            <BookingSuccessContent />
        </Suspense>
    )
}

```

## src\app\checkout\[id]\page.tsx

`$lang
'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore, useBookingStore } from '@/store'
import { Bus, MapPin, Clock, Calendar, ArrowLeft, CreditCard, Shield, ChevronRight, User, Phone, Mail, Users } from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { user } = useAuthStore()
    const { selectedSeats, clearSeats, tripId } = useBookingStore()
    const [loading, setLoading] = useState(false)
    const [passengerDetails, setPassengerDetails] = useState<{ [key: string]: { name: string; age: string } }>({})
    const [contactInfo, setContactInfo] = useState({
        email: user?.email || '',
        phone: user?.phone || ''
    })

    // Fetch trip details
    const { data: trip, isLoading } = useQuery({
        queryKey: ['trip', id],
        queryFn: async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('trips')
                .select(`
                    *,
                    route:routes(*),
                    bus:buses(*)
                `)
                .eq('id', id)
                .single()
            if (error) throw error
            return data as any // Using any here to bypass complex nested join types for now, or specifically: Trip & { route: Route, bus: Bus }
        },
        enabled: !!id
    })

    useEffect(() => {
        // Initialize passenger details for selected seats
        const initialDetails: { [key: string]: { name: string; age: string } } = {}
        selectedSeats.forEach(seat => {
            initialDetails[seat.id] = { name: '', age: '' }
        })
        setPassengerDetails(initialDetails)
    }, [selectedSeats])

    // Redirect if no seats selected
    useEffect(() => {
        if (selectedSeats.length === 0 && !isLoading) {
            toast.error('No seats selected')
            router.push(`/book/${id}`)
        }
    }, [selectedSeats, router, id, isLoading])

    const updatePassenger = (seatId: string, field: 'name' | 'age', value: string) => {
        setPassengerDetails(prev => ({
            ...prev,
            [seatId]: { ...prev[seatId], [field]: value }
        }))
    }

    const handlePayment = async () => {
        // Validate passenger details
        for (const seat of selectedSeats) {
            const details = passengerDetails[seat.id]
            if (!details?.name.trim()) {
                toast.error(`Please enter passenger name for seat ${seat.label}`)
                return
            }
            if (!details?.age.trim()) {
                toast.error(`Please enter passenger age for seat ${seat.label}`)
                return
            }
        }

        if (!contactInfo.email) {
            toast.error('Please enter email address')
            return
        }
        if (!contactInfo.phone) {
            toast.error('Please enter phone number')
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()
            
            // Create booking
            const totalAmount = selectedSeats.length * (trip?.base_price || 0)
            
            const { data: booking, error: bookingError } = await (supabase
                .from('bookings') as any)
                .insert([{
                    user_id: user?.id,
                    trip_id: id,
                    total_amount: totalAmount,
                    status: 'pending'
                }])
                .select()
                .single()

            if (bookingError) throw bookingError

            // Create booking seats
            const bookingSeats = selectedSeats.map(seat => ({
                booking_id: booking.id,
                seat_id: seat.id,
                seat_label: seat.label,
                price: trip?.base_price,
                status: 'locked'
            }))

            const { error: seatsError } = await (supabase
                .from('booking_seats') as any)
                .insert(bookingSeats)

            if (seatsError) throw seatsError

            // Store passenger details (in a real app, you'd have a passengers table)
            // For now, we'll proceed to mock payment
            
            toast.success('Booking created! Proceeding to payment...')
            
            // Clear booking store
            clearSeats()
            
            // Redirect to success page (in a real app, you'd integrate a payment gateway)
            router.push(`/booking/success?booking_id=${booking.id}`)
            
        } catch (err: any) {
            toast.error(err.message || 'Failed to create booking')
        } finally {
            setLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        )
    }

    const totalAmount = selectedSeats.length * (trip?.base_price || 0)

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            
            <main className="pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href={`/book/${id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                        <ArrowLeft size={18} />
                        <span>Back to seat selection</span>
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Passenger Details */}
                            <div className="card">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Users size={20} className="text-blue-500" />
                                    Passenger Details
                                </h2>
                                <p className="text-sm text-slate-400 mb-6">
                                    Please enter details for each passenger as per government ID
                                </p>
                                
                                <div className="space-y-6">
                                    {selectedSeats.map(seat => (
                                        <div key={seat.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                                                    <span className="text-blue-400 font-bold">{seat.label}</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">Seat {seat.label}</p>
                                                    <p className="text-xs text-slate-400 capitalize">{seat.type} • {seat.deck} deck</p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label text-xs">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={passengerDetails[seat.id]?.name || ''}
                                                        onChange={(e) => updatePassenger(seat.id, 'name', e.target.value)}
                                                        placeholder="As per ID proof"
                                                        className="input py-2.5 text-sm"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="label text-xs">Age</label>
                                                    <input
                                                        type="number"
                                                        value={passengerDetails[seat.id]?.age || ''}
                                                        onChange={(e) => updatePassenger(seat.id, 'age', e.target.value)}
                                                        placeholder="Age in years"
                                                        className="input py-2.5 text-sm"
                                                        min="1"
                                                        max="120"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="card">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Phone size={20} className="text-blue-500" />
                                    Contact Information
                                </h2>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label text-xs">Email Address</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="email"
                                                value={contactInfo.email}
                                                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                                                className="input pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label text-xs">Phone Number</label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="tel"
                                                value={contactInfo.phone}
                                                onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                                                className="input pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="card">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <CreditCard size={20} className="text-blue-500" />
                                    Payment Method
                                </h2>
                                
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-blue-500 transition-colors">
                                        <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-blue-600" />
                                        <div className="flex-1 flex items-center justify-between">
                                            <span className="text-white font-medium">Credit/Debit Card</span>
                                            <div className="flex gap-1">
                                                <span className="text-xs text-slate-500">VISA</span>
                                                <span className="text-xs text-slate-500">Mastercard</span>
                                                <span className="text-xs text-slate-500">RuPay</span>
                                            </div>
                                        </div>
                                    </label>
                                    
                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-blue-500 transition-colors">
                                        <input type="radio" name="payment" className="w-4 h-4 text-blue-600" />
                                        <span className="text-white font-medium">UPI (Google Pay, PhonePe, Paytm)</span>
                                    </label>
                                    
                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-blue-500 transition-colors">
                                        <input type="radio" name="payment" className="w-4 h-4 text-blue-600" />
                                        <span className="text-white font-medium">Net Banking</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-6">
                            <div className="card sticky top-24">
                                <h3 className="font-bold text-white mb-4">Booking Summary</h3>
                                
                                {/* Trip Info */}
                                <div className="space-y-3 pb-4 border-b border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Bus size={14} />
                                        <span>{trip?.bus?.name}</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">
                                            {trip?.route?.origin} → {trip?.route?.destination}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(trip?.departure_time).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            , {new Date(trip?.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Seats */}
                                <div className="py-4 border-b border-slate-800">
                                    <p className="text-sm text-slate-400 mb-2">Selected Seats</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSeats.map(seat => (
                                            <span key={seat.id} className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 font-medium">
                                                {seat.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Price Breakdown */}
                                <div className="py-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Ticket Price ({selectedSeats.length} seats)</span>
                                        <span className="text-white">₹{(selectedSeats.length * (trip?.base_price || 0)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">GST (5%)</span>
                                        <span className="text-white">₹{Math.round(totalAmount * 0.05).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Convenience Fee</span>
                                        <span className="text-white">₹50</span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                                    <span className="font-bold text-white">Total Amount</span>
                                    <span className="text-2xl font-bold text-white">
                                        ₹{(totalAmount + Math.round(totalAmount * 0.05) + 50).toLocaleString()}
                                    </span>
                                </div>
                                
                                <button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <Shield size={18} />
                                            <span>Pay Securely</span>
                                            <ChevronRight size={18} />
                                        </>
                                    )}
                                </button>
                                
                                <p className="text-xs text-center text-slate-500 mt-4">
                                    By proceeding, you agree to our Terms of Service and Cancellation Policy
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

```

## src\app\dashboard\layout.tsx

`$lang
'use client'

import Navbar from '@/components/common/Navbar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Ticket, User, Settings, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/dashboard', label: 'Profile Settings', icon: User, exact: true },
    { href: '/dashboard/bookings', label: 'My Bookings', icon: Ticket },
    { href: '/dashboard/payments', label: 'Payment History', icon: CreditCard },
    { href: '/dashboard/preferences', label: 'Preferences', icon: Settings },
]

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row gap-8 pb-12">
                {/* Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="card p-3 sticky top-24 space-y-1">
                        <h3 className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">My Account</h3>
                        {navItems.map(item => {
                            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                                        isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    )}
                                >
                                    <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    )
}

```

## src\app\dashboard\bookings\page.tsx

`$lang
'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Ticket, Calendar, Clock, MapPin, Bus, Download, FileText } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { useState } from 'react'

// Mock Data
const MOCK_BOOKINGS = [
    {
        id: 'BK492810X',
        status: 'confirmed',
        date: '15 May 2024',
        amount: 2520,
        trip: {
            origin: 'Mumbai', destination: 'Goa', date: '21 May 2024', departure_time: '21:30', arrival_time: '06:00', duration: '8h 30m',
            bus: { name: 'Volvo Multi-Axle AC Sleeper' }
        },
        seats: ['U-1A', 'U-1B']
    },
    {
        id: 'BK827192M',
        status: 'completed',
        date: '10 Feb 2024',
        amount: 850,
        trip: {
            origin: 'Pune', destination: 'Mumbai', date: '12 Feb 2024', departure_time: '07:00', arrival_time: '11:00', duration: '4h 00m',
            bus: { name: 'Shamolly Standard Non-AC' }
        },
        seats: ['12', '13']
    }
]

export default function MyBookingsPage() {
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">My Bookings</h1>
                <p className="text-slate-400 text-sm">View and manage all your upcoming and past trips</p>
            </div>

            <div className="space-y-4">
                {MOCK_BOOKINGS.map(booking => (
                    <Card key={booking.id} className="p-0 overflow-hidden hover:border-slate-700 transition-colors">
                        {/* Header */}
                        <div className="bg-slate-900 border-b border-slate-800 p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className={`badge ${booking.status === 'confirmed' ? 'badge-success' : 'badge-ghost'}`}>
                                    {booking.status.toUpperCase()}
                                </span>
                                <span className="text-sm font-semibold text-slate-300 font-mono">ID: {booking.id}</span>
                            </div>
                            <div className="text-sm text-slate-400 text-right">
                                Booked on: {booking.date}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-5 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bus size={18} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">
                                            {booking.trip.origin} <span className="text-slate-500 mx-1">→</span> {booking.trip.destination}
                                        </h3>
                                        <p className="text-sm text-slate-400 mb-2">{booking.trip.bus.name}</p>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-500" /> {booking.trip.date}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-500" /> {booking.trip.departure_time}</span>
                                            <span className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded text-xs font-semibold">Seat: {booking.seats.join(', ')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions & Price */}
                            <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-end justify-between lg:justify-center gap-4 border-t lg:border-t-0 border-slate-800 pt-4 lg:pt-0 lg:pl-6 lg:border-l">
                                <div className="text-center sm:text-right w-full lg:w-auto">
                                    <p className="text-xs text-slate-500 mb-1">Total Paid</p>
                                    <p className="text-2xl font-bold text-white">₹{booking.amount}</p>
                                </div>
                                {booking.status === 'confirmed' && (
                                    <button
                                        onClick={() => setSelectedTicket(selectedTicket === booking.id ? null : booking.id)}
                                        className="btn-outline !py-2 !px-4 text-sm whitespace-nowrap"
                                    >
                                        {selectedTicket === booking.id ? 'Hide E-Ticket' : 'View E-Ticket'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Expanded E-Ticket with QR */}
                        {selectedTicket === booking.id && (
                            <div className="bg-slate-950 border-t border-dashed border-slate-700 p-6 flex flex-col md:flex-row gap-8 items-center justify-center">
                                <div className="bg-white p-4 rounded-xl shadow-lg">
                                    <QRCodeSVG
                                        value={JSON.stringify({ id: booking.id, src: booking.trip.origin, dest: booking.trip.destination })}
                                        size={160}
                                        level="Q"
                                        includeMargin={false}
                                    />
                                    <p className="text-center text-slate-900 font-mono text-xs font-bold mt-3">{booking.id}</p>
                                </div>
                                <div className="space-y-4 max-w-sm text-center md:text-left">
                                    <div>
                                        <h4 className="font-bold text-lg text-white mb-2">Show this QR code at boarding</h4>
                                        <p className="text-sm text-slate-400 mb-4">You do not need a printed copy. The conductor will scan this QR code to verify your ticket.</p>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-4">
                                        <button className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300">
                                            <Download size={16} /> Download PDF
                                        </button>
                                        <button className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-300">
                                            <FileText size={16} /> Email Ticket
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    )
}

```

## src\app\search\page.tsx

`$lang
'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
    ArrowRight,
    Bus,
    Calendar,
    Coffee,
    Filter,
    MapPin,
    Power,
    Search,
    Shield,
    SlidersHorizontal,
    Star,
    Wifi,
} from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import { createClient } from '@/lib/supabase/client'
import type { Bus as BusData, Route as RouteData, Trip as TripData } from '@/types/supabase'

type SearchTrip = TripData & {
    route?: RouteData
    bus?: BusData
}

function SearchContent() {
    const searchParams = useSearchParams()
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''
    const date = searchParams.get('date') || ''

    const [filters, setFilters] = useState({
        busType: 'all',
        priceRange: [0, 5000],
        sortBy: 'departure_time',
    })
    const [showFilters, setShowFilters] = useState(false)

    const supabase = createClient()

    const { data: trips, isLoading } = useQuery({
        queryKey: ['search-trips', from, to, date],
        queryFn: async () => {
            let query = supabase
                .from('trips')
                .select(`
                    *,
                    route:routes!inner(*),
                    bus:buses!inner(*)
                `)

            if (from) query = query.ilike('route.origin', `%${from}%`)
            if (to) query = query.ilike('route.destination', `%${to}%`)
            if (date) {
                const startOfDay = `${date}T00:00:00`
                const endOfDay = `${date}T23:59:59`
                query = query.gte('departure_time', startOfDay).lte('departure_time', endOfDay)
            }

            const { data, error } = await query
            if (error) throw error
            return (data || []) as SearchTrip[]
        }
    })

    const filteredTrips = useMemo(() => {
        return trips?.filter((trip) => {
            if (filters.busType !== 'all' && trip.bus?.bus_type !== filters.busType) return false
            if (trip.base_price < filters.priceRange[0] || trip.base_price > filters.priceRange[1]) return false
            return true
        }).sort((a, b) => {
            if (filters.sortBy === 'price_low') return a.base_price - b.base_price
            if (filters.sortBy === 'price_high') return b.base_price - a.base_price
            if (filters.sortBy === 'departure_time') {
                return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
            }
            return 0
        })
    }, [filters, trips])

    const getAmenityIcon = (amenity: string) => {
        const icons: Record<string, typeof Wifi> = {
            WiFi: Wifi,
            'Charging Point': Power,
            'Water Bottle': Coffee,
            Blanket: Shield,
        }
        const Icon = icons[amenity] || Star
        return <Icon size={14} />
    }

    const activeFilterCount = Number(filters.busType !== 'all') + Number(filters.priceRange[1] < 5000) + Number(filters.sortBy !== 'departure_time')

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            <main className="pt-24 pb-12">
                <div className="section-shell space-y-6 sm:space-y-8">
                    <section className="card overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.12),transparent_30%)]" />
                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-4">
                                <span className="eyebrow">Search Results</span>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                                        <MapPin size={14} className="text-blue-400" />
                                        {from || 'Anywhere'}
                                    </span>
                                    <ArrowRight size={14} className="text-slate-600" />
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                                        <MapPin size={14} className="text-orange-400" />
                                        {to || 'Anywhere'}
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                                        <Calendar size={14} className="text-emerald-400" />
                                        {date
                                            ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : 'All dates'}
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                                        Buses from {from || 'anywhere'} to {to || 'anywhere'}
                                    </h1>
                                    <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
                                        Compare departure times, bus types, seat availability, and amenities in a layout that stays readable on mobile.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setShowFilters((prev) => !prev)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 lg:hidden"
                                >
                                    <SlidersHorizontal size={16} />
                                    Filters
                                    {activeFilterCount > 0 ? (
                                        <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                            {activeFilterCount}
                                        </span>
                                    ) : null}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="inline-flex items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-300 transition-colors hover:bg-blue-500/20"
                                >
                                    Modify Search
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                        <aside className={`${showFilters ? 'block' : 'hidden'} xl:block`}>
                            <div className="card sticky top-24 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="eyebrow">Refine Results</p>
                                        <h2 className="mt-2 text-xl font-bold text-white">Filters</h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFilters({ busType: 'all', priceRange: [0, 5000], sortBy: 'departure_time' })}
                                        className="text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
                                    >
                                        Reset all
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <section className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                            <Filter size={16} className="text-blue-400" />
                                            Sort By
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { id: 'departure_time', label: 'Departure Time' },
                                                { id: 'price_low', label: 'Price: Low to High' },
                                                { id: 'price_high', label: 'Price: High to Low' },
                                            ].map((option) => (
                                                <label
                                                    key={option.id}
                                                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-3 py-3 text-sm text-slate-300 transition-colors hover:bg-white/8"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="sort"
                                                        checked={filters.sortBy === option.id}
                                                        onChange={() => setFilters((prev) => ({ ...prev, sortBy: option.id }))}
                                                        className="h-4 w-4 border-slate-700 bg-slate-800 text-blue-600"
                                                    />
                                                    <span>{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="space-y-3">
                                        <div className="text-sm font-semibold text-white">Bus Type</div>
                                        <div className="flex flex-wrap gap-2">
                                            {['all', 'AC Seater', 'AC Sleeper', 'Non-AC Seater', 'Non-AC Sleeper'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFilters((prev) => ({ ...prev, busType: type }))}
                                                    className={`rounded-full px-3 py-2 text-xs font-bold transition-all ${
                                                        filters.busType === type
                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                            : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                                                    }`}
                                                >
                                                    {type === 'all' ? 'All Types' : type}
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-sm font-semibold text-white">Max Fare</div>
                                            <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                                                Rs. {filters.priceRange[1].toLocaleString()}
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="5000"
                                            step="100"
                                            value={filters.priceRange[1]}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, priceRange: [0, Number(e.target.value)] }))}
                                            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-blue-600"
                                        />
                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span>Rs. 0</span>
                                            <span>Rs. 5,000</span>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </aside>

                        <section className="space-y-4">
                            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {isLoading ? 'Searching available buses...' : `${filteredTrips?.length || 0} buses found`}
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        Live inventory styled for fast scanning across phones, tablets, and desktop.
                                    </p>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
                                    <Bus size={14} className="text-blue-400" />
                                    Responsive results view
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <div key={index} className="card h-52 animate-pulse bg-slate-900/60" />
                                    ))}
                                </div>
                            ) : filteredTrips?.length === 0 ? (
                                <div className="card py-16 text-center">
                                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-slate-600">
                                        <Search size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">No buses found</h3>
                                    <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
                                        Adjust your route, date, or fare filter and try again. The layout is ready, but there are no matching trips for this selection.
                                    </p>
                                </div>
                            ) : (
                                filteredTrips?.map((trip) => (
                                    <article
                                        key={trip.id}
                                        className="card border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] transition-all duration-300 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10"
                                    >
                                        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                                            <div className="min-w-0 flex-1 space-y-5">
                                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="truncate text-xl font-black text-white sm:text-2xl">{trip.bus?.name}</h3>
                                                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                                                                {trip.bus?.bus_type}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm text-slate-400">
                                                            {trip.available_seats} seats available for this departure
                                                        </p>
                                                    </div>

                                                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-sm font-bold text-amber-300">
                                                        <Star size={14} fill="currentColor" />
                                                        4.8 rating
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 rounded-2xl border border-white/8 bg-slate-950/40 p-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                                                    <div className="space-y-1">
                                                        <p className="text-3xl font-black text-white">
                                                            {new Date(trip.departure_time).toLocaleTimeString('en-IN', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: false,
                                                            })}
                                                        </p>
                                                        <p className="text-sm font-semibold text-slate-300">{trip.route?.origin}</p>
                                                    </div>

                                                    <div className="flex flex-col items-center gap-2 text-center">
                                                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                                            {trip.route?.estimated_duration_minutes} min
                                                        </p>
                                                        <div className="flex w-full max-w-[180px] items-center gap-2 text-slate-600">
                                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                            <div className="h-px flex-1 border-t border-dashed border-slate-700" />
                                                            <Bus size={14} />
                                                            <div className="h-px flex-1 border-t border-dashed border-slate-700" />
                                                            <div className="h-2 w-2 rounded-full border border-slate-600" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 md:text-right">
                                                        <p className="text-3xl font-black text-white">
                                                            {new Date(trip.arrival_time).toLocaleTimeString('en-IN', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: false,
                                                            })}
                                                        </p>
                                                        <p className="text-sm font-semibold text-slate-300">{trip.route?.destination}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {trip.bus?.amenities?.slice(0, 4).map((amenity: string) => (
                                                        <span
                                                            key={amenity}
                                                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300"
                                                        >
                                                            {getAmenityIcon(amenity)}
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex w-full flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:p-5 xl:w-64">
                                                <div className="flex items-start justify-between xl:flex-col xl:items-end xl:text-right">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Starting Fare</p>
                                                        <p className="mt-1 text-3xl font-black text-blue-400">
                                                            Rs. {Number(trip.base_price).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                                                        {trip.available_seats} left
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/book/${trip.id}`}
                                                    className="btn-primary flex w-full items-center justify-center gap-2 text-sm"
                                                >
                                                    <span>Select Seats</span>
                                                    <ArrowRight size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    )
}

```

## src\components\admin\AdminSidebar.tsx

`$lang
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    BarChart3,
    Bus,
    Calendar,
    CreditCard,
    LayoutGrid,
    LogOut,
    Map,
    Settings,
    Ticket,
    Users,
    X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutGrid, exact: true },
    { href: '/admin/buses', label: 'Buses', icon: Bus },
    { href: '/admin/layouts', label: 'Seat Layouts', icon: LayoutGrid },
    { href: '/admin/routes', label: 'Routes', icon: Map },
    { href: '/admin/trips', label: 'Trips', icon: Calendar },
    { href: '/admin/bookings', label: 'Bookings', icon: Ticket },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/staff', label: 'Staff', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
]

type AdminSidebarProps = {
    collapsed: boolean
    mobileOpen: boolean
    onToggleCollapse: () => void
    onCloseMobile: () => void
}

export default function AdminSidebar({
    collapsed,
    mobileOpen,
    onToggleCollapse,
    onCloseMobile,
}: AdminSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, setUser } = useAuthStore()

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        setUser(null)
        toast.success('Logged out successfully')
        onCloseMobile()
        router.push('/auth/login')
    }

    return (
        <>
            <button
                type="button"
                aria-label="Close admin navigation"
                onClick={onCloseMobile}
                className={cn(
                    'fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity lg:hidden',
                    mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
            />

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-white/10 bg-slate-950/95 shadow-2xl shadow-slate-950/40 backdrop-blur-xl transition-all duration-300',
                    collapsed ? 'w-20' : 'w-72',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full',
                    'lg:translate-x-0'
                )}
            >
                <div className="flex h-18 items-center gap-3 border-b border-white/10 px-4">
                    <Link
                        href="/admin"
                        onClick={onCloseMobile}
                        className={cn(
                            'flex min-w-0 items-center gap-3',
                            collapsed && 'lg:justify-center'
                        )}
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                            <Bus size={18} className="text-white" />
                        </div>
                        <div className={cn('min-w-0', collapsed && 'lg:hidden')}>
                            <p className="truncate text-sm font-semibold text-white">Shamolly Transit</p>
                            <p className="truncate text-xs text-slate-400">Operations Console</p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={onCloseMobile}
                        className="ml-auto rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="border-b border-white/10 px-3 py-3">
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className={cn(
                            'hidden w-full items-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:flex',
                            collapsed ? 'justify-center' : 'justify-between'
                        )}
                    >
                        <span className={cn(collapsed && 'hidden')}>Compact Navigation</span>
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            {collapsed ? 'Expand' : 'Compact'}
                        </span>
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    {navItems.map((item) => {
                        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onCloseMobile}
                                title={collapsed ? item.label : undefined}
                                className={cn(
                                    'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white',
                                    collapsed && 'lg:justify-center'
                                )}
                            >
                                <item.icon
                                    size={18}
                                    className={cn(
                                        'shrink-0',
                                        isActive ? 'text-white' : 'text-slate-500 transition-colors group-hover:text-slate-300'
                                    )}
                                />
                                <span className={cn('truncate', collapsed && 'lg:hidden')}>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="border-t border-white/10 p-3">
                    <div
                        className={cn(
                            'mb-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3',
                            collapsed && 'lg:px-2'
                        )}
                    >
                        <p className={cn('text-[11px] uppercase tracking-[0.22em] text-slate-500', collapsed && 'lg:hidden')}>
                            Signed In
                        </p>
                        <p className={cn('truncate text-sm font-medium text-white', collapsed && 'lg:hidden')}>
                            {user?.email || 'Admin session'}
                        </p>
                        <div className={cn('hidden h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white lg:flex', !collapsed && 'lg:hidden')}>
                            <Users size={16} />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        title={collapsed ? 'Logout' : undefined}
                        className={cn(
                            'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-300',
                            collapsed && 'lg:justify-center'
                        )}
                    >
                        <LogOut size={18} className="shrink-0" />
                        <span className={cn(collapsed && 'lg:hidden')}>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

```

## src\components\common\Brand.tsx

`$lang
'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

type BrandProps = {
  className?: string
  dark?: boolean
  compact?: boolean
  iconOnly?: boolean
  href?: string
}

export default function Brand({
  className,
  dark = false,
  compact = false,
  iconOnly = false,
  href = '/',
}: BrandProps) {
  return (
    <Link href={href} className={cn('group inline-flex items-center gap-3', className)}>
      <span
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-[1.3rem] ring-1 transition-transform duration-300 group-hover:scale-[1.03]',
          compact ? 'h-10 w-10 rounded-[1rem]' : 'h-14 w-14',
          dark
            ? 'bg-gradient-to-br from-[#f7c96d] via-[#e6ab36] to-[#ba7b14] ring-white/10'
            : 'bg-gradient-to-br from-[#4f82e3] via-[#3767cb] to-[#254ba7] ring-blue-100'
        )}
      >
        <span className="absolute inset-[2px] rounded-[1.05rem] bg-white/12" />
        <span className="absolute inset-[8px] rounded-[0.95rem] border border-white/16" />
        <span className="absolute left-1/2 top-1/2 h-[64%] w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-[2px]" />
        <span className="relative z-10 flex items-center justify-center">
          <span
            className={cn(
              'outfit text-white drop-shadow-[0_3px_8px_rgba(15,23,42,0.18)]',
              compact ? 'text-[1rem]' : 'text-[1.45rem]'
            )}
          >
            V
          </span>
          <span
            className={cn(
              'outfit -ml-1.5 mt-2 text-white/92',
              compact ? 'text-[0.78rem]' : 'text-[1.05rem]'
            )}
          >
            /
          </span>
        </span>
        <span className="absolute bottom-[0.82rem] left-1/2 h-[2px] w-[44%] -translate-x-1/2 rounded-full bg-white/40" />
      </span>

      {!iconOnly ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'outfit font-extrabold tracking-[-0.05em]',
              compact ? 'text-[1.45rem]' : 'text-[2.05rem]',
              dark ? 'text-white' : 'text-slate-900'
            )}
          >
            Voyatra
          </span>
          {!compact ? (
            <span
              className={cn(
                '-mt-0.5 text-[0.66rem] font-semibold uppercase tracking-[0.32em]',
                dark ? 'text-amber-300/85' : 'text-[#3969c5]'
              )}
            >
              Travel Club
            </span>
          ) : null}
        </span>
      ) : null}
    </Link>
  )
}

```

## src\components\common\Card.tsx

`$lang
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`card ${className}`}>{children}</div>
}

```

## src\components\common\Navbar.tsx

`$lang
'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Search, User, LogOut, Menu, X, Ticket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Brand from '@/components/common/Brand'

type NavLinkItem = {
    href: string
    label: string
    icon?: LucideIcon
}

const navLinks: NavLinkItem[] = [
    { href: '/search', label: 'Bus Search', icon: Search },
    { href: '/dashboard/bookings', label: 'My Tickets', icon: Ticket },
    { href: '/dashboard', label: 'Account', icon: User },
]

const homeNavLinks: NavLinkItem[] = [
    { href: '/', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '/dashboard/bookings', label: 'My Bookings' },
    { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
    const { user, setUser } = useAuthStore()
    const router = useRouter()
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const isHome = pathname === '/'
    const desktopLinks = isHome ? homeNavLinks : navLinks

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }

        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        setMobileOpen(false)
        setUser(null)
        toast.success('Logged out successfully')
        router.push('/')
    }

    return (
        <header className={cn(
            'fixed inset-x-0 top-0 z-50 transition-all duration-500',
            isHome
                ? 'border-b border-slate-200/90 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]'
                : scrolled
                    ? 'border-b border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl'
                    : 'bg-slate-950/35 backdrop-blur-md'
        )}>
            <div className="relative mx-auto flex h-20 max-w-[2048px] items-center justify-between px-6 sm:px-10 lg:h-[96px] lg:px-14">
                {/* Logo */}
                <Brand className="relative z-10 flex-shrink-0" compact={false} />

                {/* Desktop Nav */}
                <nav className={cn(
                    'hidden lg:flex',
                    isHome
                        ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-12 xl:gap-16'
                        : 'min-w-0 items-center justify-center gap-10'
                )}>
                    {desktopLinks.map((link) => {
                        const isActive = link.href === '/'
                            ? pathname === '/'
                            : !isHome && (pathname === link.href || pathname.startsWith(link.href + '/'))
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    'group relative rounded-xl px-1 py-2 font-medium transition-all duration-300',
                                    isHome
                                        ? isActive
                                            ? 'text-[1.08rem] font-semibold text-[#3969c5] xl:text-[1.14rem]'
                                            : 'text-[1.08rem] font-medium text-slate-700 hover:text-[#3969c5] xl:text-[1.14rem]'
                                        : isActive
                                            ? 'text-white bg-white/10'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    {link.icon ? <link.icon size={16} /> : null}
                                    {link.label}
                                </span>
                                {isActive && !isHome && (
                                    <span className={cn(
                                        'absolute bottom-0 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full',
                                        isHome ? 'bg-[#3969c5]' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                    )} />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Right Actions */}
                <div className="relative z-10 ml-auto flex items-center gap-2 sm:gap-3">
                    {user ? (
                        <div className="flex items-center gap-2">
                            <Link 
                                href="/dashboard" 
                                className={cn(
                                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all sm:px-4',
                                    isHome
                                        ? 'border border-blue-200 bg-white text-slate-800 hover:border-blue-300 hover:text-blue-600'
                                        : 'border border-white/10 bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-slate-300 hover:from-blue-600/30 hover:to-cyan-500/20 hover:text-white'
                                )}
                            >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <User size={12} className="text-white" />
                                </div>
                                <span className="hidden font-semibold sm:block">{user.full_name?.split(' ')[0] || 'Account'}</span>
                            </Link>
                            <button 
                                onClick={handleLogout} 
                                className={cn(
                                    'rounded-xl border p-2 transition-all',
                                    isHome
                                        ? 'border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
                                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-400'
                                )}
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="hidden items-center gap-2 lg:flex">
                            <Link
                                href="/auth/register"
                                className={cn(
                                    'text-sm',
                                    isHome
                                        ? 'inline-flex h-[56px] min-w-[250px] items-center justify-center gap-3 rounded-[1.1rem] border-2 border-[#3969c5] bg-white px-7 py-3 text-[1rem] font-semibold text-[#3969c5] transition-colors hover:bg-blue-50'
                                        : 'btn-primary !px-5 !py-2'
                                )}
                            >
                                {isHome ? <><User size={20} strokeWidth={2} /> Login / Signup</> : 'Sign Up'}
                            </Link>
                        </div>
                    )}

                    {/* Mobile hamburger */}
                    <button 
                        className={cn(
                            'rounded-xl border p-2 transition-all md:hidden',
                            isHome
                                ? 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
                                : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        )}
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className={cn(
                    'px-4 py-4 backdrop-blur-xl md:hidden',
                    isHome ? 'border-t border-slate-200 bg-white/95' : 'border-t border-white/10 bg-slate-950/95'
                )}>
                    <div className="mx-auto flex max-w-7xl flex-col gap-2">
                        <div className={cn(
                            'rounded-2xl border p-3',
                            isHome ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'
                        )}>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                {user ? 'Signed In' : 'Guest Mode'}
                            </p>
                            <p className={cn('mt-1 text-sm font-medium', isHome ? 'text-slate-900' : 'text-white')}>
                                {user?.full_name || 'Plan your next trip'}
                            </p>
                            <p className="text-sm text-slate-400">
                                {user?.email || 'Search routes, compare departures, and book faster on mobile.'}
                            </p>
                        </div>

                        {desktopLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 rounded-2xl px-3 py-3 transition-all',
                                    isHome ? 'text-slate-700 hover:bg-slate-50 hover:text-blue-600' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                )}
                            >
                                {link.icon ? <link.icon size={18} /> : null}
                                {link.label}
                            </Link>
                        ))}

                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            'flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                                            isHome ? 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                                        )}
                                    >
                                        Open Account
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className={cn(
                                            'rounded-2xl border px-4 py-3 text-sm font-medium transition-colors',
                                            isHome ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100' : 'border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15'
                                        )}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            'flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-medium transition-colors',
                                            isHome ? 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                                        )}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            'flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold',
                                            isHome
                                                ? 'border border-blue-400 bg-white text-blue-600'
                                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30'
                                        )}
                                    >
                                        {isHome ? 'Login / Signup' : 'Create Account'}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}

```

## src\components\providers\QueryProvider.tsx

`$lang
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    )

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

```

## src\lib\utils.ts

`$lang
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount)
}

export function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateString))
}

export function formatDateShort(dateString: string): string {
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateString))
}

export function formatTime(dateString: string): string {
    return new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(dateString))
}

export function calculateDuration(departure: string, arrival: string): string {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours === 0) return `${minutes}m`
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}m`
}

export function generateBookingReference(): string {
    return 'BK' + Math.random().toString(36).substring(2, 10).toUpperCase()
}

export function slugify(str: string): string {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

```

## src\lib\supabase\client.ts

`$lang
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

```

## src\lib\supabase\server.ts

`$lang
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    )
}

```

## src\store\index.ts

`$lang
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Booking, Seat } from '@/types/supabase'

// Auth Store
interface AuthState {
    user: User | null
    setUser: (user: User | null) => void
}
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
        }),
        { name: 'auth-store' }
    )
)

// Booking Store - tracks in-progress seat selection
interface BookingState {
    tripId: string | null
    selectedSeats: Seat[]
    lockedSeats: string[] // seat IDs locked by others in real-time
    setTripId: (tripId: string | null) => void
    toggleSeat: (seat: Seat) => void
    clearSeats: () => void
    setLockedSeats: (seats: string[]) => void
}
export const useBookingStore = create<BookingState>((set) => ({
    tripId: null,
    selectedSeats: [],
    lockedSeats: [],
    setTripId: (tripId) => set({ tripId, selectedSeats: [] }),
    toggleSeat: (seat) =>
        set((state) => {
            const exists = state.selectedSeats.find((s) => s.id === seat.id)
            return {
                selectedSeats: exists
                    ? state.selectedSeats.filter((s) => s.id !== seat.id)
                    : [...state.selectedSeats, seat],
            }
        }),
    clearSeats: () => set({ selectedSeats: [], tripId: null }),
    setLockedSeats: (seats) => set({ lockedSeats: seats }),
}))

```

## src\types\supabase.ts

`$lang
export type UserRole = 'admin' | 'agent' | 'customer' | 'staff'

export type SeatType = 'seater' | 'sleeper' | 'driver' | 'empty'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded'

export type TripStatus = 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled'

export type SeatStatus = 'available' | 'locked' | 'booked'

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'

export type PaymentGateway = 'stripe' | 'razorpay'

export interface Seat {
    id: string
    label: string
    type: SeatType
    row: number
    col: number
    deck: 'lower' | 'upper'
}

export interface SeatLayoutData {
    rows: number
    cols: number
    seats: Seat[]
    hasUpperDeck: boolean
}

export interface User {
    id: string
    email: string
    full_name: string
    phone?: string
    role: UserRole
    avatar_url?: string
    created_at: string
}

export interface Bus {
    id: string
    name: string
    registration_number: string
    bus_type: string
    total_seats: number
    amenities: string[]
    created_at: string
}

export interface SeatLayout {
    id: string
    bus_id: string
    name: string
    layout_data: SeatLayoutData
    is_template: boolean
    created_at: string
}

export interface Route {
    id: string
    origin: string
    destination: string
    distance_km: number
    estimated_duration_minutes: number
    stops: string[]
    created_at: string
}

export interface Trip {
    id: string
    route_id: string
    bus_id: string
    departure_time: string
    arrival_time: string
    base_price: number
    status: TripStatus
    available_seats: number
    route?: Route
    bus?: Bus
}

export interface Booking {
    id: string
    user_id: string
    trip_id: string
    total_amount: number
    status: BookingStatus
    qr_code?: string
    created_at: string
    trip?: Trip
    booking_seats?: BookingSeat[]
    payment?: Payment
}

export interface BookingSeat {
    id: string
    booking_id: string
    seat_id: string
    seat_label: string
    price: number
    status: SeatStatus
}

export interface Payment {
    id: string
    booking_id: string
    transaction_id: string
    gateway: PaymentGateway
    amount: number
    currency: string
    status: PaymentStatus
    created_at: string
}

export interface Staff {
    id: string
    user_id: string
    role: 'driver' | 'conductor' | 'helper'
    license_number?: string
    experience_years?: number
    is_active: boolean
    user?: User
}

export interface TripStaff {
    id: string
    trip_id: string
    staff_id: string
    role: string
    staff?: Staff
}

// Database type stub (to be generated by Supabase CLI)
export type Database = {
    public: {
        Tables: {
            users: { Row: User; Insert: Partial<User>; Update: Partial<User> }
            buses: { Row: Bus; Insert: Partial<Bus>; Update: Partial<Bus> }
            seat_layouts: { Row: SeatLayout; Insert: Partial<SeatLayout>; Update: Partial<SeatLayout> }
            routes: { Row: Route; Insert: Partial<Route>; Update: Partial<Route> }
            trips: { Row: Trip; Insert: Partial<Trip>; Update: Partial<Trip> }
            bookings: { Row: Booking; Insert: Partial<Booking>; Update: Partial<Booking> }
            booking_seats: { Row: BookingSeat; Insert: Partial<BookingSeat>; Update: Partial<BookingSeat> }
            payments: { Row: Payment; Insert: Partial<Payment>; Update: Partial<Payment> }
            staff: { Row: Staff; Insert: Partial<Staff>; Update: Partial<Staff> }
        }
        Views: object
        Functions: object
    }
}

```

