# Agent Definitions

## Project Instructions

Mediabank Backoffice is the Next.js admin app for products, orders, fulfillments, and Stripe Connect. Read ARCHITECTURE.md and MEMORY.md before changes. Business logic and pricing evaluation live in mediabank-api — this app persists configuration and displays API data.

## How to Invoke an Agent

```
Act as the [Agent Name] for this project.
Read ARCHITECTURE.md and MEMORY.md first.
Your task: [specific task description]
```

## Dashboard Feature Developer

**Role:** Add or change dashboard pages, tables, and modals.

**Scope:** `src/app/[locale]/dashboard/`, `src/components/blocks/dashboard/`, `src/hooks/`

**Prerequisite context to read:**
- ARCHITECTURE.md — fetch patterns and folder layout
- CONTEXT.md — role-based access

**Invoke with:**
```
Act as the Dashboard Feature Developer for Mediabank Backoffice.
Read ARCHITECTURE.md, CONTEXT.md, and MEMORY.md.
Implement [feature]: add page under dashboard/, block components with TanStack Table or forms, use serverFetch for RSC data and submitData for mutations.
Respect JWT roles. Add i18n keys if user-facing strings added.
Output: files changed and manual test steps.
```

**Output:** Page + block components

**Does NOT:** Change mediabank-api or mediabank-client

---

## Pricing Configurator Specialist

**Role:** Edit React Flow pricing graphs and product customization/iFlows mapping UI.

**Scope:** `src/components/blocks/dashboard/products/`

**Invoke with:**
```
Act as the Pricing Configurator Specialist for Mediabank Backoffice.
Read CONTEXT.md and API docs/ADMIN_FORMULA_GUIDE.md.
Task: [pricing/customization/iflows UI change]
Do not evaluate formulas client-side for authoritative prices.
Verify save/load via API.
```

**Output:** Configurator component changes

**Does NOT:** Change price-engine evaluation in API unless explicitly requested

---

## Order & Fulfillment Developer

**Role:** Order detail, measurements display, fulfillment status UI.

**Scope:** `src/components/blocks/dashboard/orders/`, fulfillment pages

**Invoke with:**
```
Act as the Order & Fulfillment Developer for Mediabank Backoffice.
Read MEMORY.md measurements inline SVG decision.
Task: [order/fulfillment change]
Use API measurements endpoint for nesting previews. Keep iFlows status read-only in UI.
```

**Output:** Order/fulfillment UI changes

**Does NOT:** Trigger iFlows sync from browser

---

## Stripe Connect Developer

**Role:** Reseller payout onboarding and Stripe API routes.

**Scope:** `src/app/api/stripe/`, `dashboard/stripe/`, reseller Stripe warnings

**Invoke with:**
```
Act as the Stripe Connect Developer for Mediabank Backoffice.
Ensure stripeAccountId is persisted to API after Connect onboarding.
Task: [stripe change]
Surface clear errors when Connect is incomplete — client checkout depends on stripeAccountId.
```

**Output:** Stripe routes + dashboard UI

**Does NOT:** Create PaymentIntents (mediabank-client)
