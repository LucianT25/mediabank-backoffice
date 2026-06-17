# Workflow: Fix Bug

## When to Use This

Regression or incorrect behavior in dashboard UI, fetchers, or Stripe routes.

## Steps

1. Reproduce with role context (super vs reseller vs manufacturer)
2. Trace data: UI → `clientFetch`/`submitData`/`serverFetch` → API response
3. Fix at correct layer (display vs fetch vs API — prefer API if business rule)
4. Check MEMORY.md for known pitfalls
5. Manual test on affected dashboard route

## Common Mistakes

- Fixing symptoms in UI when API returns wrong data
- Stripe errors from missing env in local `.env`
- SWR cache stale after mutation — call mutate or revalidate tag
