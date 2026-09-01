import HeroCarousel from "@/components/HeroCarousel";
import { clientConfig } from "@/config/client";
import { heroSlides } from "@/content/projects";
import { formatIndianCurrency } from "@/lib/utils";

type HeroProps = {
  onGetQuote: () => void;
};

export default function Hero({ onGetQuote }: HeroProps) {
  return (
    <section className="relative isolate flex min-h-[560px] items-center overflow-hidden bg-stone-900 text-white lg:min-h-[660px]">
      <HeroCarousel slides={heroSlides} />

      {/* pb accounts for the carousel dots so they never overlap the stats */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 pb-24 lg:px-8 lg:py-24 lg:pb-28">
        <div className="max-w-2xl">
          <p className="inline-flex rounded-full border border-orange-400/50 bg-orange-500/15 px-4 py-1 text-sm font-medium text-orange-200 backdrop-blur-sm">
            {clientConfig.tagline}
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-tight drop-shadow-lg md:text-5xl lg:text-6xl">
            Build your dream home with{" "}
            <span className="text-orange-400">{clientConfig.name}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-stone-200 drop-shadow">
            {clientConfig.description} Packages starting from{" "}
            <strong className="text-white">
              {formatIndianCurrency(clientConfig.ratePerSqFt)}/sq ft
            </strong>
            .
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onGetQuote}
              className="rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-orange-600"
            >
              Get Free Quote
            </button>
            <a
              href="#gallery"
              className="rounded-full border border-white/40 bg-white/10 px-8 py-4 text-center text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              View Projects
            </a>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/20 pt-8">
            <div>
              <dt className="text-2xl font-bold text-orange-400">
                {clientConfig.stats.projectsDelivered}
              </dt>
              <dd className="mt-1 text-sm text-stone-300">Projects delivered</dd>
            </div>
            <div>
              <dt className="text-2xl font-bold text-orange-400">
                {clientConfig.stats.yearsExperience}
              </dt>
              <dd className="mt-1 text-sm text-stone-300">Years experience</dd>
            </div>
            <div>
              <dt className="text-2xl font-bold text-orange-400">
                {clientConfig.stats.clientRating}
              </dt>
              <dd className="mt-1 text-sm text-stone-300">Client rating</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
