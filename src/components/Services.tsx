const services = [
  {
    title: "Foyer Unit",
    description:
      "Make a lasting first impression with a stylish, functional foyer — shoe racks, mirrors, and storage that welcome guests beautifully.",
    icon: "🪞",
  },
  {
    title: "TV Unit",
    description:
      "Sleek, modern TV units with concealed wiring, display shelves, and designs that complement your living room layout.",
    icon: "📺",
  },
  {
    title: "Modular Kitchen",
    description:
      "Efficient, elegant kitchens tailored to your cooking style — parallel, L-shape, U-shape, and island layouts available.",
    icon: "🍳",
  },
  {
    title: "Wardrobe Designs",
    description:
      "Custom wardrobes with smart storage, premium finishes, and layouts designed for bedrooms of every size.",
    icon: "👔",
  },
  {
    title: "Full Home Interior",
    description:
      "End-to-end interior solutions for 2 BHK to villas — cohesive design across every room in your home.",
    icon: "🏠",
  },
  {
    title: "Home Construction",
    description:
      "New home construction with quality materials, transparent pricing, and project management from foundation to handover.",
    icon: "🏗️",
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-white px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            Our Services
          </p>
          <h2 className="mt-2 text-3xl font-bold text-stone-900 md:text-4xl">
            Complete interior solutions, tailored for your dream home
          </h2>
          <p className="mt-4 text-stone-600">
            From a single room makeover to full home construction — we handle
            design, execution, and handover.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-2xl border border-stone-200 bg-stone-50 p-6 transition hover:border-orange-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                {service.icon}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-stone-900">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
