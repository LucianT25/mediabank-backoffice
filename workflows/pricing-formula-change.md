# Workflow: Pricing Formula Change

## When to Use This

Editing product pricing graph, customization options, or iFlows mapping.

## Steps

1. Read API `docs/ADMIN_FORMULA_GUIDE.md`
2. Change UI in `product-pricing-configurator.tsx` or related blocks
3. Save via existing product API endpoints
4. Verify with API price-engine quote (not browser math)
5. If BOM metrics change, coordinate with API price-engine specialist

## Common Mistakes

- Client-side formula evaluation for display as final price
- Breaking graph JSON shape expected by API
- Forgetting iFlows mapping when adding new product variants
