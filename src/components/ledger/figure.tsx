import { cn } from "@/lib/utils";
import { fractionDigits } from "@/lib/currency";
import { toMajor, type Minor } from "@/lib/money";

/**
 * A monetary figure, set the accountant's way: monospace, tabular, and
 * negatives in red (parentheses) rather than with a minus sign.
 */
export function Figure({
  value,
  currency = "BDT",
  showCurrency = false,
  className,
}: {
  value: Minor;
  currency?: string;
  showCurrency?: boolean;
  className?: string;
}) {
  const digits = fractionDigits(currency);
  const negative = value < 0n;
  const abs = negative ? -value : value;

  const body = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    ...(showCurrency
      ? { style: "currency" as const, currency, currencyDisplay: "narrowSymbol" as const }
      : {}),
  }).format(toMajor(abs, digits));

  return (
    <span
      className={cn("figure", negative && "figure--neg", className)}
      aria-label={negative ? `minus ${body}` : body}
    >
      {negative ? `(${body})` : body}
    </span>
  );
}
