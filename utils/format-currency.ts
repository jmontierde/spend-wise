// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
};

// Format currency with the appropriate symbol
export function formatCurrency(amount: number, currency: string = "PHP"): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formatted = new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  return `${symbol}${formatted}`;
}

// Format currency with sign (+ or -)
export function formatCurrencyWithSign(
  amount: number,
  isPositive: boolean,
  currency: string = "PHP"
): string {
  const formatted = formatCurrency(amount, currency);
  return isPositive ? `+${formatted}` : `-${formatted}`;
}
