export const clientConfig = {
  name: "AK Constructions",
  tagline: "Interior Design & Home Construction",
  description:
    "Complete interior solutions and home construction — from modular kitchens to full home builds.",
  ratePerSqFt: 1899,
  currency: "INR",
  currencySymbol: "₹",
  phone: "+91 63834 34544",
  whatsapp: "916383434544",
  email: "nareshdev03@gmail.com",
  city: "Your City",
  serviceAreas: ["City Center", "North Zone", "South Zone", "East Zone"],
  social: {
    instagram: "https://instagram.com/akconstructions",
    facebook: "https://facebook.com/akconstructions",
  },
} as const;

export const navLinks = [
  { label: "Kitchen Designs", href: "#services" },
  { label: "Living Room", href: "#gallery" },
  { label: "Bedroom", href: "#gallery" },
  { label: "Recent Projects", href: "#gallery" },
  { label: "Reviews", href: "#reviews" },
  { label: "How It Works", href: "#how-it-works" },
] as const;

export const bhkOptions = [
  { label: "2 BHK", sqFt: 900 },
  { label: "3 BHK", sqFt: 1200 },
  { label: "4 BHK", sqFt: 1600 },
  { label: "5+ BHK / Villa", sqFt: 2500 },
  { label: "Other", sqFt: 0 },
] as const;

export const timelineOptions = [
  "Immediately",
  "Within 1 month",
  "1–3 months",
  "3–6 months",
  "Just exploring",
] as const;

export const workTypes = [
  "Interior Design Only",
  "Construction Only",
  "Interior + Construction",
] as const;
