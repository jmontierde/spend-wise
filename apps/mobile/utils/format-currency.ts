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
export function formatCurrency(
  amount: number,
  currency: string = "PHP",
  compact: boolean = false
): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const absAmount = Math.abs(amount);

  if (compact) {
    if (absAmount >= 1000000) {
      return `${symbol}${(absAmount / 1000000).toFixed(1)}M`;
    }
    if (absAmount >= 1000) {
      return `${symbol}${(absAmount / 1000).toFixed(1)}K`;
    }
    return `${symbol}${Math.round(absAmount)}`;
  }

  const formatted = new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

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
