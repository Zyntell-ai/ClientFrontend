# Zyntell Frontend Dashboard

A premium, production-ready React dashboard for the Zyntell AI Bot Platform.

## Tech Stack
- **React 18** + **Vite**
- **React Router v6** — client-side routing with auth guards
- **Zustand** — global auth state (persisted to localStorage)
- **TanStack Query** — data fetching, caching, background refetching
- **Recharts** — analytics charts
- **React Hook Form + Zod** — form validation
- **Tailwind CSS** — utility-first styling with custom dark theme
- **Framer Motion** — micro-animations
- **React Hot Toast** — toast notifications
- **Lucide React** — icons

## Pages & Backend Mapping

| Page | Route | Backend Endpoints |
|------|-------|------------------|
| Login | `/login` | `POST /api/auth/login` |
| Signup (multi-step) | `/signup` | `GET /api/categories`, `POST /api/auth/register` |
| Onboarding Wizard | `/onboarding` | `POST /api/onboarding/complete` |
| Dashboard | `/dashboard` | `GET /api/business/dashboard` |
| Bookings | `/bookings` | `GET /api/bookings`, `PUT /api/bookings/:id/status` |
| Calendar | `/bookings/calendar` | `GET /api/bookings/view/calendar` |
| Services | `/services` | `GET/POST/PUT/DELETE /api/business/services` |
| Staff | `/staff` | `GET/POST/DELETE /api/business/staff` |
| Customers | `/customers` | `GET /api/customers`, `POST /api/customers/:id/reengage` |
| Leads | `/leads` | `GET /api/leads`, `POST /api/leads/:id/claim`, `POST /api/leads/:id/bid` |
| Analytics | `/analytics` | `GET /api/analytics/bookings`, `/customers`, `/revenue` |
| Billing | `/billing` | `GET /api/billing/current`, `/invoices`, `POST /api/billing/pay` |
| Commissions | `/commissions` | `GET /api/commissions`, `/summary` |
| Phone Numbers | `/numbers` | `GET/POST/DELETE /api/numbers` |
| Settings | `/settings` | `GET/PUT /api/business/settings`, `/hours`, `/faqs` |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit VITE_API_URL to point to your backend

# 3. Start development server
npm run dev
# → http://localhost:5173

# 4. Build for production
npm run build
```

## Project Structure

```
src/
├── api/              # Axios API service layer (one file per resource)
│   ├── apiClient.js  # Axios instance with JWT interceptor
│   ├── auth.api.js
│   ├── business.api.js
│   ├── bookings.api.js
│   └── ...
├── store/
│   └── authStore.js  # Zustand store (token + business profile)
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   └── DashboardLayout.jsx
│   └── ui/
│       └── index.jsx # Button, Input, Modal, Card, Badge, Table, etc.
├── pages/
│   ├── auth/         # Login, Signup (multi-step + dynamic category)
│   ├── onboarding/   # 5-step bot setup wizard
│   ├── dashboard/    # Main dashboard with stats + activity
│   ├── bookings/     # List view + calendar view
│   ├── services/     # CRUD services
│   ├── staff/        # CRUD staff
│   ├── customers/    # Customer list + reengage
│   ├── leads/        # Exclusive / Broadcast / Auction tabs
│   ├── analytics/    # Charts: bookings, customers, revenue
│   ├── billing/      # Plans + invoices + payment
│   ├── commissions/  # Commission history + summary
│   ├── numbers/      # Virtual phone number management
│   └── settings/     # Bot config + hours + FAQs + notifications
└── utils/
    └── index.js      # Formatters (₹, dates) + constants
```

## Auth Flow

1. **Signup** → 3-step: Category selection (fetched from backend) → Business details (dynamic per category) → Account credentials
2. **Register** → `POST /api/auth/register` → JWT stored in Zustand (persisted)
3. **Onboarding Guard** → If `business.setupCompleted === false`, redirect to `/onboarding`
4. **Dashboard Guard** → If not authenticated, redirect to `/login`
5. **Auto-refresh** → On app load, `GET /api/auth/me` refreshes business profile

## Design System

- **Background**: `#040d21` (deep navy)
- **Cards**: Glassmorphism with `backdrop-blur` + subtle gradient borders
- **Primary**: `#3b82f6` (electric blue)
- **Success**: `#10b981` (emerald green) — used for commissions & revenue
- **Warning**: `#f59e0b` (amber) — used for trial banners & pending items
- **Font**: `Syne` (display/headings) + `DM Sans` (body)

## Notes

- All monetary values are in Indian Rupees (₹)
- Default language is Telugu (`te`) — matches backend's Indian market focus
- Lead quality: HOT 🔥 > WARM ♨️ > MILD_OKAY 🌊 > MILD_NOT_OKAY 🌫️ > COLD ❄️
- Commission types: BOOKING (customer books) + SHOWUP (customer attends)
- The `botTrainingScore` (0–100%) reflects service/staff/config completeness
