# Memory

_Last updated: 2026-06-16. Re-run the `update-memory` agent after major architectural changes._

## Architectural Decisions

### Decision: Stripe Connect onboarding in Next.js API routes

**What:** `app/api/stripe/create-account`, `create-account-session`, `create-login-link` wrap Stripe; API stores `stripeAccountId` on reseller.

**Evidence:** `src/app/api/stripe/`, dashboard stripe page

**What to avoid:** Duplicating Connect logic in mediabank-client — client only consumes `stripeAccountId`.

---

### Decision: React Flow for product pricing graphs

**What:** Visual formula editor persists graph structure to API; evaluation is server-side.

**Evidence:** `product-pricing-configurator.tsx`

**What to avoid:** Evaluating formulas in the browser for authoritative quotes.

---

### Decision: Inline SVG for measurement previews

**What:** `measurements-section.tsx` renders API-returned SVG strings directly (collapsible flat UI). API loads previews from R2 production assets or stored `geometryMetrics` — no geometry recompute for current orders.

**Evidence:** `measurements-section.tsx`, API `GET /price-engine/measurements`

**What to avoid:** `<Image src={blobUrl}>` for dynamic measurement SVGs.

---

## Anti-Patterns

### Checkout blocked by empty stripeAccountId

**Don't:** Assume resellers can take payments without completing Stripe onboarding.

**Do:** Surface `stripe-warning.tsx` and dashboard Stripe page until `stripeOnboarded`.

---

## Recurring AI Suggestion Problems

- AI suggests **moving admin CRUD to API-only** — this app is the intended admin UI.
- AI suggests **Next.js 16 patterns** — backoffice is on Next 15 App Router.
