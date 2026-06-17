# Architecture

## System Overview

Mediabank Backoffice is a **Next.js 15.1.6** admin app (Node **22.13.1**, React 19) for resellers, manufacturers, and super-admins. It manages products (formula pricing via **React Flow**), materials, orders, fulfillments, Stripe Connect onboarding, and iFlows product mapping. Organization is **App Router** under `src/app/[locale]/dashboard/` with feature UI in `src/components/blocks/dashboard/`.

All business data lives in **mediabank-api**; this app is a JWT-authenticated UI shell plus local Stripe Connect API routes.

---

## Folder Structure

```
mediabank-backoffice/src/
├── app/
│   ├── [locale]/
│   │   ├── dashboard/              # Authenticated admin area
│   │   │   ├── products/[productId]/pricing|customization|iflows/
│   │   │   ├── orders/, order-fulfillments/
│   │   │   ├── materials/, resellers/, manufacturers/, buyers/
│   │   │   └── stripe/
│   │   ├── auth/                   # login, register, password flows
│   │   └── onboarding/
│   └── api/
│       ├── auth/[...nextauth]/
│       └── stripe/                 # Connect account + login link routes
├── components/
│   ├── blocks/dashboard/           # Feature tables, configurators, order detail
│   └── ui/                         # shadcn/Radix
├── hooks/                          # useFetcher (SWR), useSubmitData
├── lib/                            # fetcher, auth, configurator-url, compression
└── interfaces/                     # TS types mirroring API
```

---

## Layer Rules

| Layer | May import |
|-------|------------|
| Dashboard pages (RSC) | `serverFetch`, block components |
| Client blocks | `useSession`, `clientFetch`, `submitData`, TanStack Table |
| `lib/` | No React; fetch + pure helpers |
| React Flow pricing UI | Local graph state → persisted via API product endpoints |

- Use `routes` + `serverFetch` / `clientFetch` / `submitData` from `@/lib/fetcher`.
- Role-based UI: JWT roles include `super`, `reseller-{key}`, `manufacturer-{key}` — gate features in pages/components.

---

## Data Flow

```
Admin action in dashboard (client)
  → submitData / clientFetch with session accessToken
  → mediabank-api (authoritative)
  → revalidate via Next cache tags or SWR mutate

Stripe Connect onboarding
  → app/api/stripe/create-account|create-account-session
  → Stripe API + update reseller via API
  → stripeAccountId populated for client checkout
```

---

## Key Conventions

| Artifact | Pattern |
|----------|---------|
| Tables | TanStack Table in `*-table.tsx` blocks |
| Pricing editor | `product-pricing-configurator.tsx` + `@xyflow/react` |
| Order detail | `order-details.tsx`, `measurements-section.tsx` (inline SVG previews) |
| iFlows mapping | `iflows-configurator.tsx` per product |
| Configurator links | `lib/configurator-url.ts` → `FRONTEND_URL` |
| Money | `formatCurrency` |

---

## Related Apps

- **mediabank-api** — all CRUD, pricing engine, iFlows sync, measurements API
- **mediabank-client** — customer shop; uses reseller `stripeAccountId` from here
