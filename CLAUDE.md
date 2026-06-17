Read AGENTS.md at the start of every session for project context, architectural constraints, and agent definitions.

# Mediabank Backoffice

Next.js 15 admin app for Mediabank — products, pricing graphs, orders, fulfillments, Stripe Connect.

## Before coding

1. Read `ARCHITECTURE.md` and `MEMORY.md`
2. Use `lib/fetcher.ts` for all API access
3. Do not duplicate business rules from mediabank-api

For step-by-step development procedures, follow the workflows in `./workflows/`.

## Agent Shortcuts

| Shortcut | Agent | Workflow |
|----------|-------|----------|
| `dashboard <feature>` | Dashboard Feature Developer | `workflows/add-dashboard-feature.md` |
| `fix <issue>` | Dashboard Feature Developer | `workflows/fix-bug.md` |
| `pricing <product>` | Pricing Configurator Specialist | `workflows/pricing-formula-change.md` |
| `stripe <task>` | Stripe Connect Developer | `workflows/add-dashboard-feature.md` |
| `order <task>` | Order & Fulfillment Developer | `workflows/fix-bug.md` |

To invoke: start your message with the shortcut. Example: `dashboard materials-export` runs the dashboard workflow for a materials export feature.
