"use client";

import Image from "next/image";
import { useState } from "react";

interface DishImageProps {
  src: string | null;
  alt: string;
  /** Passed to next/image for responsive loading hints. */
  sizes?: string;
}

/**
 * Dish photo with a branded fallback when there is no image or it fails to
 * load. Admins may point imageUrl at any host, so the optimizer's host
 * allowlist can't cover them — images render `unoptimized` through
 * `next/image` until a fixed storage host exists (Phase 7) and can be added
 * to `images.remotePatterns`.
 */
export function DishImage({ src, alt, sizes }: DishImageProps) {
  // Keyed by src so a corrected URL retries after an earlier failure.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <span aria-hidden className="text-4xl">
        🍽️
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes={sizes ?? "(min-width: 48rem) 20rem, 100vw"}
      className="object-cover"
      onError={() => setFailedSrc(src)}
    />
  );
}
