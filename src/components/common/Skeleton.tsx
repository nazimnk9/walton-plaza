/**
 * @file src/components/common/Skeleton.tsx
 * @description Reusable styling skeleton loading placeholders.
 * Provides abstract loading boxes and structured grids that mimic actual UI containers
 * during resource loading phases, suppressing jarring layout shifts.
 */

import { cn } from '@/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Skeleton - Foundational, low-level animated box mockup.
 * 
 * @param props.className - Custom Tailwind CSS classes to dictate dimensional shapes.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded bg-neutral-200 dark:bg-neutral-800', className)}
      {...props}
    />
  );
}

/**
 * ProductCardSkeleton - Complex composite loading block.
 * Structurally matches the exact height, padding, borders, and margins of the `<ProductCard />`
 * component to offer high fidelity previews during catalog fetches.
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {/* Product Image placeholder box */}
      <Skeleton className="aspect-square w-full rounded-xl" />
      
      {/* Product Information details placeholders */}
      <div className="mt-4 flex flex-1 flex-col space-y-3">
        {/* Brand/category small badge placeholder */}
        <Skeleton className="h-4 w-1/3" />
        
        {/* Product title multiline placeholder */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Price values and discount percent side-by-side loaders */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        
        {/* Purchase button action bar skeleton wrapper */}
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

