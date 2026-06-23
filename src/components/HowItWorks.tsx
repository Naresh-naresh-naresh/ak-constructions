const steps = [
  {
    step: "01",
    title: "Free consultation",
    description:
      "Share your floor plan, BHK, and budget. We understand your vision and site requirements.",
  },
  {
    step: "02",
    title: "Design & estimate",
    description:
      "Receive 3D designs and a transparent quote based on sq ft, materials, and scope of work.",
  },
  {
    step: "03",
    title: "Build & install",
    description:
      "Our team executes interiors or full construction with milestone updates and quality checks.",
  },
  {
    step: "04",
    title: "Handover",
    description:
      "Final walkthrough, snag fixes, and warranty support — your dream home, ready to move in.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-stone-900 px-4 py-16 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-400">
            Process
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            How AK Constructions works with you
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <article
              key={item.step}
              className="rounded-2xl border border-stone-700 bg-stone-800/50 p-6"
            >
              <span className="text-3xl font-bold text-orange-400">
                {item.step}
              </span>
              <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-300">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
