/**
 * @file src/components/plp/Pagination.tsx
 * @description Numeric pagination controls for the Product Listing Page (PLP).
 * Enables clean, explicit indexing parameters to load standard catalog frames.
 * 
 * Performance & SEO Design:
 * - Search Crawler Crawlability: Rather than hiding products behind continuous infinite scrolls,
 *   we use explicit URLs (`/?page=X`) utilizing standard routing parameters. This guarantees that
 *   search engine crawler bots can seamlessly discover and catalog deep catalog items.
 * - Dynamic Chunk bounds: Enforces a sliding window page selection (e.g. `[1 ... 3 4 5 ... 10]`)
 *   to keep navigations extremely clean regardless of total item sizes.
 * - React 19 Transition integration: Page mutations wrap inside `startTransition` to prevent
 *   freezing the browser thread when loading fresh resources.
 */

'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

/**
 * Pagination - Numeric page navigator control.
 * 
 * @param props.currentPage - The current active page index.
 * @param props.totalPages - The mathematical maximum page counts derived from items database size.
 */
export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // If there is only one page or no products, suppress layout rendering entirely
  if (totalPages <= 1) return null;

  /**
   * Serializes dynamic page index targets and schedules high-performance route mutation.
   */
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  // Generate dynamic page index arrays with sliding window buffers surrounding current active indices
  const pages = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12 py-4">
      {/* 
        Previous Page Indicator:
        Disabled if the user resides on page index 1.
      */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition-all duration-200 hover:bg-neutral-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800",
          isPending && "animate-pulse"
        )}
        aria-label="Navigate to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Render leading ellipses first page anchors if out of sliding buffer scope */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => handlePageChange(1)}
            disabled={isPending}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-extrabold hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-white"
          >
            1
          </button>
          {startPage > 2 && <span className="text-xs text-neutral-400 font-bold px-1" aria-hidden="true">...</span>}
        </>
      )}

      {/* Display computed dynamic sliding page buttons grid */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          disabled={isPending}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black transition-all duration-200 cursor-pointer",
            currentPage === p
              ? "bg-[#1b4f93] text-white shadow-md shadow-[#1b4f93]/20"
              : "border border-neutral-100 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          )}
          aria-current={currentPage === p ? 'page' : undefined}
          aria-label={`Go to page ${p}`}
        >
          {p}
        </button>
      ))}

      {/* Render trailing ellipses maximum page anchors if out of sliding buffer scope */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-xs text-neutral-400 font-bold px-1" aria-hidden="true">...</span>}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={isPending}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-extrabold hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-white"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* 
        Next Page Indicator:
        Disabled if the user resides on final maximum page bounds.
      */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isPending}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition-all duration-200 hover:bg-neutral-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800",
          isPending && "animate-pulse"
        )}
        aria-label="Navigate to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

