import GalleryImage from "@/components/GalleryImage";
import { clientConfig } from "@/config/client";
import { heroImages } from "@/content/projects";
import { formatIndianCurrency } from "@/lib/utils";

type HeroProps = {
  onGetQuote: () => void;
};

export default function Hero({ onGetQuote }: HeroProps) {
  const [topLeft, bottomLeft, topRight, bottomRight] = heroImages;
  const featuredImage = topLeft?.src ?? heroImages[0]?.src;

  return (
    <section className="relative overflow-hidden bg-stone-900 px-4 py-16 text-white lg:px-8 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.25),_transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="inline-flex rounded-full border border-orange-400/40 bg-orange-500/10 px-4 py-1 text-sm font-medium text-orange-300">
              Interior Design & Home Construction
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Build your dream home with{" "}
              <span className="text-orange-400">{clientConfig.name}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone-300">
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
                className="rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white transition hover:bg-orange-600"
              >
                Get Free Quote
              </button>
              <a
                href="#gallery"
                className="rounded-full border border-stone-600 px-8 py-4 text-center text-base font-semibold text-white transition hover:border-stone-400 hover:bg-stone-800"
              >
                View Projects
              </a>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-stone-700 pt-8">
              <div>
                <dt className="text-2xl font-bold text-orange-400">150+</dt>
                <dd className="mt-1 text-sm text-stone-400">Projects delivered</dd>
              </div>
              <div>
                <dt className="text-2xl font-bold text-orange-400">10+</dt>
                <dd className="mt-1 text-sm text-stone-400">Years experience</dd>
              </div>
              <div>
                <dt className="text-2xl font-bold text-orange-400">4.9★</dt>
                <dd className="mt-1 text-sm text-stone-400">Client rating</dd>
              </div>
            </dl>
          </div>

          {/* Featured image — always visible on md+ screens (right side) */}
          <div className="hidden h-[320px] overflow-hidden rounded-2xl border border-stone-700 md:block lg:h-[420px]">
            <GalleryImage
              src={featuredImage}
              alt="Featured project by AK Constructions"
              className="object-cover"
            />
          </div>
        </div>

        {/* Photo collage — visible on all screen sizes, below text on mobile */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:mt-12 lg:grid-cols-4">
          {[topLeft, bottomLeft, topRight, bottomRight].map(
            (item, index) =>
              item && (
                <div
                  key={item.src}
                  className={`overflow-hidden rounded-2xl border border-stone-700 bg-stone-800 ${
                    index === 0 || index === 3 ? "h-44 sm:h-52" : "h-36 sm:h-44"
                  }`}
                >
                  <GalleryImage
                    src={item.src}
                    alt={item.alt}
                    className="object-cover"
                  />
                </div>
              )
          )}
        </div>
      </div>
    </section>
  );
}
