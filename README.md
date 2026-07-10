# NovaDigital

A front-end e-commerce demo for **NovaDigital** — a fictional technology company selling three groups of digital
services: **Cloud** (servers, Kubernetes, storage, backup, load balancer), **Kaspersky** security software, and
**international travel eSIM**.

> **This project has no backend.** There is no real API, no real database, and no real payment gateway. All data is
> mock data defined in `src/data/mocks`, served through a mock service layer (`src/services`) that simulates network
> latency, and persisted in the browser via `localStorage` (cart, session, orders, services, tickets, admin CRUD,
> language). Product names, prices, and any "partner" logos shown on the homepage are illustrative only and do not
> represent confirmed pricing or partnerships.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · React Router v6 · Zustand · react-hook-form + zod ·
react-i18next · Recharts (admin charts) · lucide-react

## Getting started

```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # type-check and build for production
npm run preview   # preview the production build locally
npm run lint      # run ESLint
npm run format    # run Prettier
```

## Demo accounts

Login at `/login`. Both accounts use the password `123456`.

| Role     | Email                     | Password | Redirects to |
| -------- | -------------------------- | -------- | ------------ |
| Customer | `customer@vtctelecom.vn` | `123456` | `/account`    |
| Admin    | `admin@vtctelecom.vn`    | `123456` | `/admin`      |

You can also register a new account at `/register` — it is created as a `customer` and stored in `localStorage`.

## Route map

**Public** (`PublicLayout`): `/`, `/products`, `/products/cloud`, `/products/kaspersky`, `/products/esim`,
`/products/:slug`, `/pricing`, `/solutions`, `/about`, `/contact`, `/support`, `/support/:slug`,
`/esim-compatible-devices`, `/terms`, `/privacy`, `/cart`, `/checkout`, `/checkout/success/:orderCode`, `*` (404).

**Auth** (`GuestRoute`, redirects away if already logged in): `/login`, `/register`, `/forgot-password`.

**Customer account** (`CustomerRoute` + `CustomerLayout`, requires a logged-in customer): `/account`,
`/account/orders`, `/account/orders/:orderCode`, `/account/services`, `/account/services/:serviceId`,
`/account/tickets`, `/account/tickets/new`, `/account/profile`, `/account/security`.

**Admin** (`AdminRoute` + `AdminLayout`, requires the `admin` role): `/admin`, `/admin/products`,
`/admin/products/new`, `/admin/products/:id/edit`, `/admin/orders`, `/admin/customers`, `/admin/services`,
`/admin/licenses`, `/admin/esims`, `/admin/tickets`, `/admin/content`.

Route guards live in `src/routes/` (`GuestRoute.tsx`, `CustomerRoute.tsx`, `AdminRoute.tsx`). An unauthenticated user
hitting a customer/admin route is redirected to `/login` and returned to the original page after signing in
(`location.state.from`). A customer hitting `/admin/*` is redirected to `/account`; an admin hitting `/account` is
redirected to `/admin`.

## Project structure

```
src/
├── assets/            static assets
├── components/
│   ├── common/        Button, Input, Select, Modal, Drawer, Tabs, Accordion, Toast, badges, Seo, etc.
│   ├── layout/         Header (mega menu), Footer, MobileNav
│   ├── animation/      RevealOnScroll, StaggerContainer, AnimatedCounter, ParallaxSection, PageTransition
│   ├── product/        ProductCard, ProductGrid, PackageSelector
│   ├── cart/           CartDrawer, CartItemRow
│   ├── checkout/       StepIndicator, OrderSummaryCard, PaymentQrPanel
│   ├── account/        CustomerSidebar, service cards
│   └── admin/          AdminSidebar, AdminHeader, DataTable, StatCard, PageHeader
├── layouts/            PublicLayout, CustomerLayout, AdminLayout
├── pages/
│   ├── public/         Home, Products (+ category pages), ProductDetail, Pricing, Solutions, About,
│   │                    Contact, Support (+ detail), eSIM devices, Terms, Privacy, Cart, Checkout
│   │                    (+ success), NotFound
│   ├── auth/           Login, Register, ForgotPassword
│   ├── customer/       Dashboard, Orders (+ detail), Services (+ detail), Tickets (+ new), Profile, Security
│   └── admin/          Dashboard, Products (+ form), Orders, Customers, Services, Licenses, eSIMs,
│                        Tickets, Content
├── routes/             AppRoutes, GuestRoute, CustomerRoute, AdminRoute
├── data/mocks/         all seed data: products (cloud/kaspersky/esim), users, orders, services, tickets,
│                        testimonials, FAQs, coupons, support articles, eSIM devices, license/eSIM stock, partners
├── services/           mock "API" layer — the only thing pages talk to for data (see below)
├── stores/             Zustand stores: authStore, cartStore, orderStore, productStore, uiStore
├── hooks/               useLocale
├── types/              shared TypeScript types/interfaces
├── utils/               cn, formatters, localize, generators, storage, delay, simulateError
├── constants/           routes.ts, config.ts, nav.ts
└── locales/             i18n.ts, vi.json, en.json
```

## Mock data included

- **Cloud** — Cloud Server (Starter/Business/Performance/Enterprise), Managed Kubernetes, Cloud Storage, Cloud
  Backup, Load Balancer.
- **Kaspersky** — Standard, Plus, Premium, Small Office Security, each with device/duration package tiers.
- **eSIM** — Japan 5GB, Korea Unlimited, Thailand 10GB, Asia Regional, Europe, USA Unlimited, Global.
- 2 users (1 customer, 1 admin), 6 orders across every `OrderStatus`, 6 customer services (2 cloud, 2 Kaspersky,
  2 eSIM) across every `ServiceStatus`, 4 support tickets, 5 testimonials, 12 FAQs (general/cloud/kaspersky/esim/
  billing/renewal), 3 coupons (`NOVA10`, `WELCOME50`, `CLOUD15`), 8 support articles, 20 eSIM-compatibility device
  entries, Kaspersky license stock and eSIM stock for the admin inventory pages.

## Where the mock layer lives (and how to swap in a real API)

Pages never import `src/data/mocks` directly — they call functions in `src/services/*Service.ts`
(`productService`, `authService`, `orderService`, `serviceService`, `ticketService`, `contentService`,
`couponService`, `inventoryService`). Each function already returns a `Promise` with a simulated 300–700ms delay, so
call sites are already written as if they were hitting a real API.

To integrate a real backend:

1. Replace the body of each function in `src/services/*.ts` with a `fetch`/`axios` call to your API, keeping the
   same function signature and return type.
2. Delete `src/services/repository.ts` (the localStorage-backed "database") and the seed files under
   `src/data/mocks/` once the backend owns that data.
3. Swap the client-side `authService.login`/`register` for real authentication, and replace the persisted
   `authStore` user object with whatever your API returns (a JWT, session cookie, etc.).
4. Nothing in `components/`, `pages/`, or `stores/` needs to change beyond that, since they only depend on the
   service function signatures and the shared types in `src/types/`.

Look for `localStorage.getItem('novadigital_debug_error')` in `src/utils/simulateError.ts` — set it to a service
call's name (e.g. `products.getProducts`) in the browser console to force that call to reject, for testing error
states during development.

## Internationalization

Default language is Vietnamese (`vi`); English (`en`) is fully supported. Toggle with the VI/EN switch in the
header. The chosen language persists to `localStorage` and is used for both UI chrome (`src/locales/vi.json` /
`en.json`) and bilingual mock content (`{ vi, en }` fields on products, FAQs, testimonials, etc., resolved via
`useLocale()` + `localize()`).

## What's implemented

Product catalog with search/filter/sort (category, price, billing cycle) and category landing pages with
comparison tables; product detail pages with a package selector (cloud specs, Kaspersky device/duration, eSIM
country/data/days) and live price calculation; cart with quantity/package edits and coupon codes; a 3-step checkout
(customer info → review → payment simulation with a placeholder VietQR/bank-transfer panel) that creates an order
and the matching customer service records; order and service history with license-key/QR placeholders; a support
ticket system; profile/security settings; a full admin back office (dashboard with charts, product CRUD, order
status management, customers, services, Kaspersky license stock, eSIM stock, ticket management, content overview);
scroll-reveal/stagger/parallax/counter animations throughout, respecting `prefers-reduced-motion`; and a responsive
layout from 320px mobile up to large desktop.

## Known limitations

- The production bundle is a single ~1.8MB chunk (494KB gzipped) since the app isn't route-code-split. Fine for a
  demo; consider `React.lazy()` per route group before shipping to production.
- The admin "Website content" page is read/browse-only for FAQs, testimonials, and support articles (no backing
  write API); banners have a local-only active/inactive toggle.
- No real email, SMS, payment, or file-upload integration anywhere — those flows are simulated with toasts and
  delays.
