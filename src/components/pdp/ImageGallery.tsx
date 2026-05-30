/**
 * @file src/components/pdp/ImageGallery.tsx
 * @description Stateful Client Component managing the Product Details Page (PDP) image display.
 * Includes thumbnail navigation grids, active element borders, and dynamic transitions.
 * 
 * Features & Aesthetics:
 * - Responsive Image container supporting lazy loading and high-fidelity layouts.
 * - Smooth transition durations (`duration-300 hover:scale-105`) to add depth during inspection.
 * - Localized fallback schema resolving missing database assets safely.
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GraphQLImage } from '@/graphql/types';
import { cn } from '@/utils/cn';

interface ImageGalleryProps {
  images: GraphQLImage[] | null | undefined;
  productName: string;
}

/**
 * ImageGallery - Visual photo viewer for specific products.
 * 
 * @param props.images - Array of product assets mapped from the database/API query.
 * @param props.productName - Product English string used for contextual alt text descriptions.
 */
export function ImageGallery({ images, productName }: ImageGalleryProps) {
  // Active selected image index state tracker hook
  const [activeIndex, setActiveIndex] = useState(0);

  // Premium inline placeholders generated in base64 to guard against missing product pictures
  const fallbackImage = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" fill="%239ca3af">No Image Available</text></svg>`;

  const hasImages = images && images.length > 0;
  const activeImage = hasImages ? images[activeIndex]?.url : fallbackImage;

  return (
    <div className="flex flex-col gap-4">
      {/* 
        Main Primary Viewport Container:
        Displays the currently active picture. Features subtle hover scale actions
        allowing users to check product curves and details easily.
      */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <Image
          src={activeImage || fallbackImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4 transition-all duration-300 hover:scale-105"
        />
      </div>

      {/* 
        Thumbnail Navigation grid selection:
        Only rendered when multiple assets exist for the product.
      */}
      {hasImages && images.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <button
              key={`${img.url}-${idx}`}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative h-20 w-20 overflow-hidden rounded-xl border-2 bg-white p-1 transition-all duration-200 hover:scale-105 active:scale-95 dark:bg-neutral-900",
                activeIndex === idx
                  ? "border-blue-600 shadow-md shadow-blue-500/10 dark:border-blue-500"
                  : "border-neutral-100 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
              )}
              aria-label={`Show product image ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

