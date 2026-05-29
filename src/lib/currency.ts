export const DEFAULT_CURRENCY = "EUR";

const eurFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: DEFAULT_CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number | null | undefined): string {
  const value = Number(amount ?? 0);
  if (!Number.isFinite(value)) return "€0.00";
  return eurFormatter.format(value);
}
