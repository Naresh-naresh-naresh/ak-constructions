"use client";

import { useState } from "react";

type GalleryImageProps = {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
};

export default function GalleryImage({
  src,
  alt,
  className = "object-cover",
  fallbackClassName = "bg-gradient-to-br from-stone-300 via-stone-200 to-orange-100",
}: GalleryImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`h-full w-full ${fallbackClassName}`}
        aria-label={`${alt} — photo coming soon`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`h-full w-full ${className}`}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
