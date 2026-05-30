/**
 * @file src/app/loading.tsx
 * @description Global loading skeleton screen for the main Product Listing Page (PLP).
 * This component is automatically triggered as a React Suspense boundary by Next.js App Router
 * while Server Components fetch GraphQL data asynchronously.
 * 
 * Design & Animation:
 * - Employs tailwind css dynamic visual pulsing (`animate-pulse`) to mimic actual layout grids.
 * - Structurally mirrors the faceted filter sidebar, sorting header, and product grids to reduce cognitive layout shift (CLS).
 * - Incorporates 9 individual `<ProductCardSkeleton />` blocks.
 */

import { ProductCardSkeleton } from '@/components/common/Skeleton';

/**
 * Loading - Renders the structural layout skeleton loader during static/dynamic server loads.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      <div className="flex flex-col gap-8 sm:flex-row">
        {/* 
          Sidebar Facet Filters Skeleton:
          Mimics the desktop filters sidebar layout with placeholders for brand selection, pricing, and category pills.
        */}
        <div className="shrink-0 sm:w-64 space-y-6">
          {/* Mobile responsive toggle header skeleton */}
          <div className="h-10 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800 sm:hidden" />
          
          {/* Desktop persistent sidebar layout skeletons */}
          <div className="hidden sm:block space-y-6 rounded-2xl border border-neutral-150 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
            <div className="h-6 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="space-y-2.5">
              <div className="h-8 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-8 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-8 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
            </div>
            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-4" />
            <div className="h-6 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="flex gap-2">
              <div className="h-8 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-8 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
            </div>
            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-4" />
            <div className="h-6 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-12 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          </div>
        </div>

        {/* 
          Main Product Catalog Catalog Grid Skeleton:
          Includes placeholders for page result counts, sorting selects, and grid cards.
        */}
        <div className="flex-1 space-y-6">
          {/* Top header stats and sort selector skeleton */}
          <div className="flex flex-col gap-4 border-b border-neutral-100 pb-5 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-4 w-32 rounded bg-neutral-150 dark:bg-neutral-800" />
            </div>
            <div className="h-8 w-36 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* 
            Faceted Product Cards Grid Layout:
            Renders exactly 9 skeleton units matching the PLP grid configuration.
          */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

