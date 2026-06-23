"use client";

import { useState } from "react";
import FloatingContact from "@/components/FloatingContact";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HeroGallery from "@/components/HeroGallery";
import HowItWorks from "@/components/HowItWorks";
import QuoteModal from "@/components/QuoteModal";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";

export default function HomePage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  const openQuote = () => setIsQuoteOpen(true);
  const closeQuote = () => setIsQuoteOpen(false);

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
