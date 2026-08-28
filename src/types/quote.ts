export type QuoteFormData = {
  bhk: string;
  sqFt: number;
  workType: string;
  timeline: string;
  name: string;
  phone: string;
  email: string;
  city: string;
};

export type QuoteFormErrors = Partial<Record<keyof QuoteFormData, string>>;

/** Where a lead is in your follow-up pipeline. */
export type QuoteStatus = "new" | "contacted" | "closed";

export type QuoteRecord = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  bhk?: string | null;
  sqFt: number;
  workType?: string | null;
  timeline?: string | null;
  estimate: number;
  status: QuoteStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateQuoteInput = QuoteFormData & { estimate: number };

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};
