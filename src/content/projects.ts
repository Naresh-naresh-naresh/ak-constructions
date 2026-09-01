/**
 * ADD IMAGES HERE
 * ----------------
 * 1. Drop photos into:  public/images/gallery/
 * 2. Update the `src` paths below (must start with /images/...)
 * 3. Save — site refreshes automatically in dev mode
 *
 * Recommended: WebP, max ~1800px on the long edge, under 250 KB each.
 * To convert a phone photo (HEIC won't display in browsers):
 *   sips -s format jpeg -Z 1800 IMG_1234.HEIC --out tmp.jpg
 *   cwebp -q 82 -metadata none tmp.jpg -o public/images/gallery/name.webp
 * If a photo comes out sideways, add `--rotate 90` to the sips command —
 * stripping metadata drops the EXIF orientation tag, so rotate the pixels.
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
    subtitle: "Custom cabinetry & counters",
    src: "/images/gallery/kitchen.webp",
    alt: "Modular kitchen with teal cabinetry and stone counters",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Living Room",
    subtitle: "False ceiling & feature lighting",
    src: "/images/gallery/living-room.webp",
    alt: "Living room with leather sofas and pendant lighting",
    className: "md:col-span-1",
  },
  {
    title: "Master Bedroom",
    subtitle: "Wardrobes & designer ceiling",
    src: "/images/gallery/bedroom.webp",
    alt: "Bedroom with fitted wardrobes and a gold accent ceiling",
    className: "md:col-span-1",
  },
  {
    title: "Home Theatre",
    subtitle: "Acoustic panels & LED lighting",
    src: "/images/gallery/home-theatre.webp",
    alt: "Home theatre room with recliners and blue LED cove lighting",
    className: "md:col-span-1",
  },
  {
    title: "Pooja Room",
    subtitle: "Custom mandir & backlit detailing",
    src: "/images/gallery/pooja-room.webp",
    alt: "Pooja room with a custom mandir and backlit wall detailing",
    className: "md:col-span-1",
  },
  {
    title: "Staircase & Interiors",
    subtitle: "Feature wall, glass railing & lighting",
    src: "/images/gallery/staircase.webp",
    alt: "Staircase with sculpted feature wall and glass railing",
    className: "md:col-span-1",
  },
  {
    title: "Completed Home",
    subtitle: "Exterior cladding & finishing",
    src: "/images/gallery/home-exterior-1.webp",
    alt: "Completed independent house with textured exterior cladding",
    className: "md:col-span-1",
  },
  {
    title: "Full Home Build",
    subtitle: "Ground + 2 floors, handed over",
    src: "/images/gallery/home-exterior-2.webp",
    alt: "Completed multi-storey residential building by AK Constructions",
    className: "md:col-span-1",
  },
  {
    title: "Our Design Studio",
    subtitle: "Visit us to plan your build",
    src: "/images/gallery/office-1.webp",
    alt: "AK Constructions design studio and reception",
    className: "md:col-span-1",
  },
];

/**
 * Hero background carousel — 5 slides, auto-advancing.
 *
 * Landscape shots only: these render full-bleed with object-cover, so a
 * portrait photo gets cropped to its middle third and reads as a mistake.
 * Ordered to show range — living space, kitchen, bedroom, theatre, exterior.
 */
export const heroSlides = [
  {
    src: "/images/gallery/living-room.webp",
    alt: "Living room interior by AK Constructions",
  },
  {
    src: "/images/gallery/kitchen.webp",
    alt: "Modular kitchen by AK Constructions",
  },
  {
    src: "/images/gallery/bedroom.webp",
    alt: "Bedroom with fitted wardrobes and designer ceiling",
  },
  {
    src: "/images/gallery/home-theatre.webp",
    alt: "Home theatre room with LED cove lighting",
  },
  {
    src: "/images/gallery/home-exterior-1.webp",
    alt: "Completed independent house by AK Constructions",
  },
];
