# Domain Context

## Application Overview

Mediabank Backoffice is the **operations and configuration UI** for the Mediabank platform. Super-admins manage resellers and catalog; resellers configure products, pricing formulas, Stripe payouts, and view orders; manufacturers handle fulfillments.

---

## Roles (JWT from API)

| Role | Typical access |
|------|----------------|
| `super` | All resellers, manufacturers, admins |
| `reseller-{key}` | Own reseller's products, orders, Stripe |
| `manufacturer-{key}` | Assigned fulfillments |

Auth source: `auth/login?source=backoffice` and Google social login.

---

## Core Workflows

1. **Product setup** — Create product → customization (materials/options) → pricing graph (React Flow formulas) → optional iFlows SKU mapping.
2. **Stripe Connect** — Reseller completes onboarding via dashboard Stripe page; sets `stripeAccountId` required for client checkout.
3. **Order management** — View order status, BOM breakdown, measurements/nesting previews (from stored `geometryMetrics` on items or live API fallback), iFlows sync status.
4. **Fulfillment** — Manufacturer updates fulfillment status on assigned items.

---

## Business Rules (backoffice responsibilities)

- Pricing formulas edited here are evaluated server-side by API — UI saves graph JSON, not computed prices.
- **Measurements section** calls API `GET price-engine/measurements` — loads SVG previews from R2 production assets or stored `geometryMetrics`; does not recompute for orders placed after geometry snapshot rollout.
- iFlows config is per-product mapping; actual ERP sync runs in API on **paid** orders only.
- Configurator preview links use `FRONTEND_URL` + reseller key + configuration id (`configurator-url.ts`).

---

## Integration Points

| Service | Where |
|---------|--------|
| mediabank-api | `API_BASE_URL` — all entities |
| Stripe Connect | `app/api/stripe/*` + `@stripe/connect-js` embedded UI |
| NextAuth | Session `accessToken` for API |

---

## What This App Does Not Do

- Customer checkout or PaymentIntent creation (mediabank-client)
- Geometry/nesting computation (mediabank-api price-engine)
- Direct iFlows HTTP from browser for order sync

---

## Terminology

Align with API CONTEXT: sign product, formula node, BOM line, fulfillment, reseller, manufacturer, graphic area, nesting sheet.
