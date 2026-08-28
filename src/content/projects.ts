/**
 * ADD IMAGES HERE
 * ----------------
 * 1. Drop photos into:  public/images/gallery/
 * 2. Update the `src` paths below (must start with /images/...)
 * 3. Save — site refreshes automatically in dev mode
 *
 * Recommended: WebP, max ~1600px on the long edge, under 250 KB each.
 * To convert a phone photo (HEIC won't display in browsers):
 *   sips -s format jpeg -Z 1400 IMG_1234.HEIC --out tmp.jpg
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
    title: "Our Design Studio",
    subtitle: "Visit us to plan your build",
    src: "/images/gallery/office-1.webp",
    alt: "AK Constructions design studio and reception",
    className: "md:col-span-2 md:row-span-2",
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
    title: "Staircase & Interiors",
    subtitle: "Feature wall, glass railing & lighting",
    src: "/images/gallery/staircase.webp",
    alt: "Staircase with sculpted feature wall and glass railing",
    className: "md:col-span-1",
  },
  {
    title: "Structure & Finishing",
    subtitle: "Jaali screens & metal partitions",
    src: "/images/gallery/interior-work.webp",
    alt: "Room with clay jaali screen and custom metal partition",
    className: "md:col-span-1",
  },
];

/** Hero section — featured image plus the collage below it */
export const heroImages = [
  // NOTE: index 0 doubles as the large featured image in Hero.tsx, so keep the
  // strongest landscape shot first — portrait photos crop badly there.
  {
    src: "/images/gallery/office-1.webp",
    alt: "AK Constructions design studio",
    className: "h-48",
  },
  {
    src: "/images/gallery/office-2.webp",
    alt: "AK Constructions studio lounge and reception",
    className: "h-36",
  },
  {
    src: "/images/gallery/home-exterior-2.webp",
    alt: "Completed multi-storey home by AK Constructions",
    className: "h-36",
  },
  {
    src: "/images/gallery/home-exterior-1.webp",
    alt: "Completed independent house exterior",
    className: "h-48",
  },
];
