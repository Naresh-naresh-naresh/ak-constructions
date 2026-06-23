"use client";

import { useEffect, useMemo, useState } from "react";
import {
  bhkOptions,
  clientConfig,
  timelineOptions,
  workTypes,
} from "@/config/client";
import {
  buildWhatsAppUrl,
  calculateQuoteEstimate,
  formatIndianCurrency,
} from "@/lib/utils";
import type { QuoteFormData, QuoteFormErrors } from "@/types/quote";

type QuoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const initialForm: QuoteFormData = {
  bhk: "",
  sqFt: 0,
  workType: workTypes[2],
  timeline: timelineOptions[0],
  name: "",
  phone: "",
  email: "",
  city: clientConfig.city,
};

function validateForm(data: QuoteFormData): QuoteFormErrors {
  const errors: QuoteFormErrors = {};

  if (!data.bhk) errors.bhk = "Please select a property type";
  if (!data.sqFt || data.sqFt < 100) {
    errors.sqFt = "Enter carpet area (minimum 100 sq ft)";
  }
  if (!data.name.trim()) errors.name = "Name is required";
  if (!/^[6-9]\d{9}$/.test(data.phone.replace(/\s/g, ""))) {
    errors.phone = "Enter a valid 10-digit mobile number";
  }
  if (!data.city.trim()) errors.city = "City is required";

  return errors;
}

export default function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
  const [form, setForm] = useState<QuoteFormData>(initialForm);
  const [errors, setErrors] = useState<QuoteFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const estimate = useMemo(
    () => calculateQuoteEstimate(form.sqFt, clientConfig.ratePerSqFt),
    [form.sqFt]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBhkChange = (label: string, defaultSqFt: number) => {
    setForm((prev) => ({
      ...prev,
      bhk: label,
      sqFt: defaultSqFt > 0 ? defaultSqFt : prev.sqFt,
    }));
    setErrors((prev) => ({ ...prev, bhk: undefined, sqFt: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, estimate }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quote request");
      }

      setIsSubmitted(true);
    } catch {
      setErrors({
        name: "Could not submit right now. Please call or WhatsApp us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = `Hi ${clientConfig.name}, I'm interested in a quote.\nBHK: ${form.bhk}\nArea: ${form.sqFt} sq ft\nEstimate: ${formatIndianCurrency(estimate)}\nName: ${form.name}\nPhone: ${form.phone}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close quote form"
      />

      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200"
          aria-label="Close"
        >
          ✕
        </button>

        {isSubmitted ? (
          <div className="p-8 text-center md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✓
            </div>
            <h2 className="mt-6 text-2xl font-bold text-stone-900">
              Thank you, {form.name}!
            </h2>
            <p className="mt-3 text-stone-600">
              Your quote request has been received. Our team will contact you
              within 24 hours with a detailed estimate.
            </p>
            <p className="mt-4 text-lg font-semibold text-orange-600">
              Indicative estimate: {formatIndianCurrency(estimate)}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href={buildWhatsAppUrl(clientConfig.whatsapp, whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600"
              >
                Chat on WhatsApp
              </a>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-stone-300 px-6 py-3 font-semibold text-stone-700 hover:bg-stone-50"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2">
            <div className="hidden bg-gradient-to-br from-stone-800 to-stone-600 p-8 text-white md:block">
              <p className="text-sm uppercase tracking-wider text-orange-300">
                Free design consultation
              </p>
              <h2
                id="quote-modal-title"
                className="mt-3 text-3xl font-bold leading-tight"
              >
                Get your home estimate in minutes
              </h2>
              <p className="mt-4 text-stone-200">
                Starting from{" "}
                <span className="font-bold text-white">
                  {formatIndianCurrency(clientConfig.ratePerSqFt)}/sq ft
                </span>{" "}
                for interior & construction packages.
              </p>

              <div className="mt-8 rounded-2xl bg-white/10 p-6 backdrop-blur">
                <p className="text-sm text-stone-300">Live estimate</p>
                <p className="mt-2 text-4xl font-bold">
                  {estimate > 0
                    ? formatIndianCurrency(estimate)
                    : "—"}
                </p>
                {form.sqFt > 0 && (
                  <p className="mt-2 text-sm text-stone-300">
                    {form.sqFt.toLocaleString("en-IN")} sq ft ×{" "}
                    {formatIndianCurrency(clientConfig.ratePerSqFt)}
                  </p>
                )}
                <p className="mt-4 text-xs leading-relaxed text-stone-400">
                  Indicative pricing only. Final quote depends on materials,
                  design scope, and site visit.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-stone-900 md:hidden">
                Get A Free Quote
              </h2>

              <fieldset className="mt-6">
                <legend className="text-sm font-semibold text-stone-800">
                  Property type
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {bhkOptions.map((option) => (
                    <label
                      key={option.label}
                      className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition ${
                        form.bhk === option.label
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-stone-300 text-stone-700 hover:border-orange-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="bhk"
                        value={option.label}
                        checked={form.bhk === option.label}
                        onChange={() =>
                          handleBhkChange(option.label, option.sqFt)
                        }
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errors.bhk && (
                  <p className="mt-2 text-sm text-red-600">{errors.bhk}</p>
                )}
              </fieldset>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="sqFt"
                    className="text-sm font-semibold text-stone-800"
                  >
                    Carpet area (sq ft)
                  </label>
                  <input
                    id="sqFt"
                    type="number"
                    min={100}
                    value={form.sqFt || ""}
                    onChange={(event) => {
                      setForm((prev) => ({
                        ...prev,
                        sqFt: Number(event.target.value),
                      }));
                      setErrors((prev) => ({ ...prev, sqFt: undefined }));
                    }}
                    placeholder="e.g. 1200"
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                  {errors.sqFt && (
                    <p className="mt-2 text-sm text-red-600">{errors.sqFt}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="timeline"
                    className="text-sm font-semibold text-stone-800"
                  >
                    When do you want to start?
                  </label>
                  <select
                    id="timeline"
                    value={form.timeline}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        timeline: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  >
                    {timelineOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="workType"
                  className="text-sm font-semibold text-stone-800"
                >
                  Work type
                </label>
                <select
                  id="workType"
                  value={form.workType}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      workType: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                >
                  {workTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 rounded-xl bg-orange-50 p-4 md:hidden">
                <p className="text-sm text-stone-600">Indicative estimate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {estimate > 0
                    ? formatIndianCurrency(estimate)
                    : "Enter sq ft to calculate"}
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-semibold text-stone-800"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Your name"
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="text-sm font-semibold text-stone-800"
                  >
                    Mobile number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="10-digit mobile"
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-stone-800"
                  >
                    Email (optional)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    placeholder="you@email.com"
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="text-sm font-semibold text-stone-800"
                  >
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={form.city}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                    placeholder="Your city"
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                  {errors.city && (
                    <p className="mt-2 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full rounded-full bg-orange-500 py-4 text-base font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Start Your Project Today!"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
