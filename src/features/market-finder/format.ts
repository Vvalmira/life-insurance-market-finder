export const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const fullNumberFormatter = new Intl.NumberFormat("en-US");

export function formatPercent(value: number | null, digits = 1): string {
  return value === null ? "Not available" : `${value.toFixed(digits)}%`;
}

export function formatScore(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}
