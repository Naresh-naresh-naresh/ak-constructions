export function formatIndianCurrency(amount: number, symbol = "₹"): string {
  return `${symbol}${amount.toLocaleString("en-IN")}`;
}

export function calculateQuoteEstimate(sqFt: number, ratePerSqFt: number): number {
  if (sqFt <= 0 || ratePerSqFt <= 0) return 0;
  return sqFt * ratePerSqFt;
}

export function formatIndianPhone(phone: string): string {
  return phone.replace(/\s/g, "");
}

/** Strips everything but digits and keeps the last 10 — normalizes +91/spacing/dashes for lookups. */
export function normalizePhone(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.slice(-10);
}

/**
 * Builds a wa.me deep link.
 *
 * Both parts are URI-encoded and the scheme/host are hardcoded, so neither
 * argument can alter the URL's structure or inject a `javascript:` scheme —
 * which matters because callers interpolate database values (client name,
 * invite code) into the message.
 */
export function buildWhatsAppUrl(
  phone: string,
  message: string
): string {
  return `https://wa.me/${encodeURIComponent(phone)}?text=${encodeURIComponent(message)}`;
}
