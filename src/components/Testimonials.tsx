const testimonials = [
  {
    name: "Priya & Rahul",
    project: "3 BHK Interior — Modular Kitchen + Wardrobes",
    quote:
      "AK Constructions delivered our full home interior on time. The kitchen design and finishing quality exceeded our expectations.",
    rating: 5,
  },
  {
    name: "Suresh Kumar",
    project: "Independent House Construction",
    quote:
      "Transparent pricing at every stage. They kept us updated weekly and the final handover was smooth.",
    rating: 5,
  },
  {
    name: "Anitha M.",
    project: "2 BHK Renovation",
    quote:
      "Professional team, clear communication, and beautiful work. The quote calculator helped us plan our budget early.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="reviews" className="bg-stone-50 px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            Reviews
          </p>
          <h2 className="mt-2 text-3xl font-bold text-stone-900 md:text-4xl">
            What our clients say
          </h2>
          <p className="mt-3 text-stone-600">
            Replace with real client testimonials and Google review links.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="flex gap-1 text-orange-400">
                {Array.from({ length: item.rating }).map((_, index) => (
                  <span key={index}>★</span>
                ))}
              </div>
              <p className="mt-4 text-stone-700 leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-6 border-t border-stone-100 pt-4">
                <p className="font-semibold text-stone-900">{item.name}</p>
                <p className="text-sm text-stone-500">{item.project}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
