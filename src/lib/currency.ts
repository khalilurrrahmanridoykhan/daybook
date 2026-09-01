import { toMajor, type Minor } from "./money";

/**
 * Per-user currency. Amounts are never converted between currencies — each user
 * (and their wallets) operate in a single currency.
 */
export const SUPPORTED_CURRENCIES = [
  { code: "BDT", label: "Bangladeshi Taka", symbol: "৳" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "Pound Sterling", symbol: "£" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { code: "AED", label: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", label: "Saudi Riyal", symbol: "﷼" },
  { code: "MYR", label: "Malaysian Ringgit", symbol: "RM" },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];

export const isSupportedCurrency = (code: string): code is CurrencyCode =>
  SUPPORTED_CURRENCIES.some((c) => c.code === code);

/** Minor-unit exponent for a currency (BDT/USD/… = 2). */
export function fractionDigits(currency: string): number {
  try {
    return (
      new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions()
        .maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

export function formatMoney(
  minor: Minor,
  currency: string,
  opts: { locale?: string; signDisplay?: Intl.NumberFormatOptions["signDisplay"] } = {},
): string {
  const digits = fractionDigits(currency);
  return new Intl.NumberFormat(opts.locale ?? "en", {
    style: "currency",
    currency,
    signDisplay: opts.signDisplay ?? "auto",
  }).format(toMajor(minor, digits));
}
