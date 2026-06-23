import GalleryImage from "@/components/GalleryImage";
import { galleryProjects } from "@/content/projects";

export default function HeroGallery() {
  return (
    <section id="gallery" className="bg-stone-50 px-4 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Portfolio
            </p>
            <h2 className="mt-2 text-3xl font-bold text-stone-900 md:text-4xl">
              Spaces we design & build
            </h2>
          </div>
          <p className="max-w-md text-stone-600">
            Explore our recent interior and construction projects — kitchens,
            bedrooms, living spaces, and complete home builds.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2 md:gap-5">
          {galleryProjects.map((item) => (
            <article
              key={item.title}
              className={`group relative min-h-[220px] overflow-hidden rounded-2xl bg-stone-200 ${item.className ?? ""}`}
            >
              <GalleryImage
                src={item.src}
                alt={item.alt}
                className="object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-stone-900/0 transition group-hover:bg-stone-900/10" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-900/70 to-transparent p-5">
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm text-stone-200">{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
