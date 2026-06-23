/**
 * ADD IMAGES HERE
 * ----------------
 * 1. Drop photos into:  public/images/gallery/
 * 2. Update the `src` paths below (must start with /images/...)
 * 3. Save — site refreshes automatically in dev mode
 *
 * Recommended size: 1200×800 px or larger, JPG/WebP, under 500 KB each
 */

export type ProjectImage = {
  title: string;
  subtitle: string;
  src: string;
  alt: string;
  className?: string;
};

/** Main portfolio grid — shown in the Gallery section */
export const galleryProjects: ProjectImage[] = [
  {
    title: "Modular Kitchen",
    subtitle: "Parallel & L-shaped layouts",
    src: "/images/gallery/shopping.webp",
    alt: "Modern modular kitchen by AK Constructions",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Living Room",
    subtitle: "TV unit & false ceiling",
    src: "/images/gallery/living-room.jpg",
    alt: "Living room interior design",
    className: "md:col-span-1",
  },
  {
    title: "Home Office",
    subtitle: "Study & storage",
    src: "/images/gallery/home-office.jpg",
    alt: "Home office study room",
    className: "md:col-span-1",
  },
  {
    title: "Bedroom",
    subtitle: "Wardrobe & lighting",
    src: "/images/gallery/bedroom.jpg",
    alt: "Bedroom with custom wardrobe",
    className: "md:col-span-1",
  },
  {
    title: "Full Home Build",
    subtitle: "Construction + interiors",
    src: "/images/gallery/full-home.jpg",
    alt: "Completed home construction project",
    className: "md:col-span-1",
  },
];

/** Hero section — 4 smaller showcase images on the right */
export const heroImages = [
  {
    src: "/images/gallery/shopping.webp",
    alt: "AK Constructions interior project",
    className: "h-48",
  },
  {
    src: "/images/gallery/hero-2.jpg",
    alt: "AK Constructions kitchen design",
    className: "h-36",
  },
  {
    src: "/images/gallery/hero-3.jpg",
    alt: "AK Constructions living room",
    className: "h-36",
  },
  {
    src: "/images/gallery/hero-4.jpg",
    alt: "AK Constructions bedroom design",
    className: "h-48",
  },
];
