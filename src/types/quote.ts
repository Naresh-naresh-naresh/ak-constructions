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
