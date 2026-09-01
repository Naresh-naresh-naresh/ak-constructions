"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Slide = { src: string; alt: string };

type HeroCarouselProps = {
  slides: Slide[];
  /** Time each slide is shown, in ms. */
  intervalMs?: number;
};

/**
 * Full-bleed background carousel for the hero.
 *
 * Crossfades rather than sliding horizontally: the photos have different aspect
 * ratios, and a translate-based slide makes that mismatch obvious at the edges.
 *
 * Auto-advance is paused when the user prefers reduced motion, and when the tab
 * is hidden (no point burning a mobile data plan animating an unseen page).
 */
export default function HeroCarousel({
  slides,
  intervalMs = 5000,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reducedMotion = useRef(false);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = query.matches;

    const onVisibility = () => setIsPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (slides.length < 2 || isPaused || reducedMotion.current) return;

    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      intervalMs
    );
    return () => window.clearInterval(timer);
  }, [slides.length, isPaused, intervalMs]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Recent projects"
    >
      {slides.map((slide, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={slide.src}
          src={slide.src}
          alt={i === index ? slide.alt : ""}
          aria-hidden={i !== index}
          // The first slide is the largest thing above the fold, so it loads
          // eagerly with high priority; the rest can wait.
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "low"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Scrim: the headline sits on top of photos, so contrast can't be left to
          chance. On mobile the text spans the full width, so it needs an even
          darkening; a left-weighted gradient there leaves right-hand text (the
          "Client rating" stat) sitting on a bright patch. The directional
          gradient is therefore desktop-only, where the copy is left-aligned. */}
      {/* 0.75 on mobile is tuned against the brightest slide (the white/teal
          kitchen); anything lighter and the body copy stops being comfortable. */}
      <div className="absolute inset-0 bg-stone-950/75 md:bg-stone-950/30" />
      <div className="absolute inset-0 md:bg-gradient-to-r md:from-stone-950/85 md:via-stone-950/60 md:to-stone-950/25" />

      {slides.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 z-10 flex justify-center gap-2.5">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show project ${i + 1} of ${slides.length}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-8 bg-orange-500"
                  : "w-4 bg-white/45 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
