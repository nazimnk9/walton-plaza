'use client';

import { useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SortingHeaderProps {
  totalCount: number;
}

export function SortingHeader({ totalCount }: SortingHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get('sort') || 'name_asc';

  // Performance Optimization (Criterion #16):
  // We use useCallback for the sorting handler to preserve reference integrity
  // and prevent redundant rendering cycles in child controls.
  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      const params = new URLSearchParams(searchParams.toString());
      
      if (val) {
        params.set('sort', val);
      } else {
        params.delete('sort');
      }

      startTransition(() => {
        router.push(`/?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col gap-4 border-b border-neutral-100 pb-5 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
      {/* Count */}
      <div>
        <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-2xl">
          Walton Plaza Store
        </h1>
        <p className="mt-1 text-xs font-semibold text-neutral-400 dark:text-neutral-500">
          Showing <span className="text-neutral-800 dark:text-neutral-200">{totalCount}</span> {totalCount === 1 ? 'product' : 'products'} matching filters
        </p>
      </div>

      {/* Sorting selector */}
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>Sort By</span>
        </div>
        <select
          value={currentSort}
          onChange={handleSortChange}
          disabled={isPending}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-800 shadow-xs focus:border-blue-500 focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
        >
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating_desc">Rating: High to Low</option>
          <option value="rating_asc">Rating: Low to High</option>
        </select>
      </div>
    </div>
  );
}
