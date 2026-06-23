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

export function buildWhatsAppUrl(
  phone: string,
  message: string
): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
