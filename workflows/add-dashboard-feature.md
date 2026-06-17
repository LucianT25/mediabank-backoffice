# Workflow: Add Dashboard Feature

## When to Use This

New admin screen, table, or modal under the dashboard.

## Before You Start

- Confirm which roles may access the feature
- Identify API routes in `routes` (`lib/fetcher.ts`)

## Steps

1. Add route under `app/[locale]/dashboard/<feature>/page.tsx`
2. Fetch initial data with `serverFetch` in RSC when possible
3. Create block components under `components/blocks/dashboard/<feature>/`
4. Client mutations via `submitData` + session token
5. Add nav entry in `nav-main.tsx` if needed
6. Add translations under `messages/`

## Checklist

- [ ] Role gating matches CONTEXT.md
- [ ] Errors surfaced via toast or inline alert
- [ ] No secrets in client bundle

## Common Mistakes

- Forgetting 401 handling (serverFetch redirects to signout)
- Duplicating API business rules in UI
- Using Image component for dynamic measurement SVGs
