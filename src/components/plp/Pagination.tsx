'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  // Generate page numbers to display
  const pages = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12 py-4">
      {/* Prev Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition-all duration-200 hover:bg-neutral-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800",
          isPending && "animate-pulse"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page Numbers */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => handlePageChange(1)}
            disabled={isPending}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-extrabold hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-white"
          >
            1
          </button>
          {startPage > 2 && <span className="text-xs text-neutral-400 font-bold px-1">...</span>}
        </>
      )}

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
        >
          {p}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-xs text-neutral-400 font-bold px-1">...</span>}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={isPending}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-extrabold hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-white"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isPending}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition-all duration-200 hover:bg-neutral-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800",
          isPending && "animate-pulse"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
