"use client";

import { useEffect, useState } from "react";
import FloatingContact from "@/components/FloatingContact";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HeroGallery from "@/components/HeroGallery";
import HowItWorks from "@/components/HowItWorks";
import QuoteModal from "@/components/QuoteModal";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";

const POPUP_DISMISSED_KEY = "ak_popup_dismissed_at";
const POPUP_DELAY_MS = 4000;
const POPUP_SNOOZE_MS = 24 * 60 * 60 * 1000;

export default function HomePage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  const openQuote = () => setIsQuoteOpen(true);
  const closeQuote = () => {
    setIsQuoteOpen(false);
    localStorage.setItem(POPUP_DISMISSED_KEY, String(Date.now()));
  };

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(POPUP_DISMISSED_KEY) || 0);
    const shouldShow = Date.now() - dismissedAt > POPUP_SNOOZE_MS;
    if (!shouldShow) return;

    const timer = setTimeout(() => setIsQuoteOpen(true), POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header onGetQuote={openQuote} />
      <main>
        <Hero onGetQuote={openQuote} />
        <HeroGallery />
        <Services />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
      <FloatingContact onGetQuote={openQuote} />
      <QuoteModal isOpen={isQuoteOpen} onClose={closeQuote} />
    </>
  );
}
