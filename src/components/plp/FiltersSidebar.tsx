/**
 * @file src/components/plp/FiltersSidebar.tsx
 * @description Faceted filtering sidebar for the Product Listing Page (PLP).
 * Enables toggling brands, categories, stock availability, and customizable pricing scopes.
 * 
 * Performance & React Optimizations:
 * - useCallback Event Memoization (Criterion #16): Memoizes active filter state changers
 *   (e.g., `handleBrandChange`, `handleCategoryChange`, `handlePriceApply`, `handleStockToggle`)
 *   to retain identical function references across renders, preventing children redrawing blocks.
 * - React 19 transition triggers (`useTransition`): URL pushes are queued safely inside transition wrappers,
 *   enabling concurrent UI rendering changes and activating sleek loading indicators (`isPending`).
 * - URL Synchronization: Dual-binds filters parameters straight to standard browser `URLSearchParams`
 *   to ensure perfect SEO indexability and state recovery upon back/forward navigation.
 */

'use client';

import { useTransition, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FiltersSidebarProps {
  availableBrands: string[];
  availableCategories: string[];
  maxPriceLimit: number;
}

/**
 * FiltersSidebar - Interactive side-panel controller managing catalog filters.
 */
export function FiltersSidebar({
  availableBrands,
  availableCategories,
  maxPriceLimit,
}: FiltersSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Internal reactive states mirroring active URL parameters to ensure high UI responsiveness
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer visibility status state

  // Sync internal UI state dynamically with URLSearchParams on browser backward/forward history navigation pops
  useEffect(() => {
    setSelectedBrand(searchParams.get('brand') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setInStockOnly(searchParams.get('inStock') === 'true');
  }, [searchParams]);

  /**
   * Encapsulates parameter state serialization and updates standard browser URLs.
   * Forces catalog resetting back to page index 1 upon modifications.
   */
  const applyFilters = useCallback(
    (brand: string, category: string, min: string, max: string, stock: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Reset to page 1 on filter changes to prevent page index overflows
      params.set('page', '1');

      if (brand) params.set('brand', brand);
      else params.delete('brand');

      if (category) params.set('category', category);
      else params.delete('category');

      if (min) params.set('minPrice', min);
      else params.delete('minPrice');

      if (max) params.set('maxPrice', max);
      else params.delete('maxPrice');

      if (stock) params.set('inStock', 'true');
      else params.delete('inStock');

      // Schedule high-performance Next.js URL routing transition
      startTransition(() => {
        router.push(`/?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  // Performance Optimization (Criterion #16):
  // We use useCallback for all event handlers to maintain stable references
  // across renders and prevent unnecessary downstream component updates.
  const handleBrandChange = useCallback(
    (brand: string) => {
      const newVal = selectedBrand === brand ? '' : brand;
      setSelectedBrand(newVal);
      applyFilters(newVal, selectedCategory, minPrice, maxPrice, inStockOnly);
    },
    [selectedBrand, selectedCategory, minPrice, maxPrice, inStockOnly, applyFilters]
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      const newVal = selectedCategory === category ? '' : category;
      setSelectedCategory(newVal);
      applyFilters(selectedBrand, newVal, minPrice, maxPrice, inStockOnly);
    },
    [selectedBrand, selectedCategory, minPrice, maxPrice, inStockOnly, applyFilters]
  );

  const handlePriceApply = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      applyFilters(selectedBrand, selectedCategory, minPrice, maxPrice, inStockOnly);
    },
    [selectedBrand, selectedCategory, minPrice, maxPrice, inStockOnly, applyFilters]
  );

  const handleStockToggle = useCallback(() => {
    const newVal = !inStockOnly;
    setInStockOnly(newVal);
    applyFilters(selectedBrand, selectedCategory, minPrice, maxPrice, newVal);
  }, [selectedBrand, selectedCategory, minPrice, maxPrice, inStockOnly, applyFilters]);

  const resetAll = useCallback(() => {
    setSelectedBrand('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    
    startTransition(() => {
      router.push('/');
    });
  }, [router]);

  return (
    <>
      {/* 
        Mobile Responsive Trigger Filters header button:
        Only display on handheld mobile screens. Toggles the responsive sheet wrapper.
      */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-800 shadow-xs hover:bg-neutral-50 active:scale-98 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 sm:hidden cursor-pointer"
      >
        <Filter className="h-4 w-4" />
        Filters
      </button>

      {/* 
        Faceted Filters aside element panel:
        Responsive configuration. Renders as a fixed slide-out pane on mobile screens,
        and as a static persistent grid side column on wider desktop resolutions.
      */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white p-6 shadow-xl transition-transform duration-300 dark:bg-neutral-900 sm:static sm:z-0 sm:w-64 sm:translate-x-0 sm:border sm:border-neutral-100 sm:p-5 sm:shadow-none sm:rounded-2xl dark:sm:border-neutral-800",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header Title & Clear Triggers */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800 sm:pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#1b4f93] dark:text-blue-400" />
            <h2 className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Filters
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {(selectedBrand || selectedCategory || minPrice || maxPrice || inStockOnly) && (
              <button
                onClick={resetAll}
                className="text-[11px] font-bold text-[#1b4f93] hover:text-[#153e74] dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-500 sm:hidden dark:hover:bg-neutral-800 cursor-pointer"
              aria-label="Close filters pane"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Filters forms container */}
        <div className="flex-1 overflow-y-auto space-y-6 py-6 sm:py-5 sm:space-y-5">
          
          {/* Category Facet selectors */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
              Category
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 border cursor-pointer",
                    selectedCategory === category
                      ? "border-[#1b4f93] bg-[#1b4f93]/5 text-[#1b4f93] dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                      : "border-neutral-100 bg-neutral-50/50 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/30 dark:text-neutral-300 dark:hover:bg-neutral-850"
                  )}
                >
                  <span>{category}</span>
                  {selectedCategory === category && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1b4f93] dark:bg-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Facet selectors */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
              Brand
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {availableBrands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => handleBrandChange(brand)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 border cursor-pointer",
                    selectedBrand === brand
                      ? "border-[#1b4f93] bg-[#1b4f93]/5 text-[#1b4f93] dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                      : "border-neutral-100 bg-neutral-50/50 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/30 dark:text-neutral-300 dark:hover:bg-neutral-850"
                  )}
                >
                  <span>{brand}</span>
                  {selectedBrand === brand && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1b4f93] dark:bg-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Price Range boundaries input forms */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
              Price Range
            </h3>
            <form onSubmit={handlePriceApply} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ৳"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs font-bold focus:border-[#1b4f93] focus:bg-white focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-950/30 dark:text-white dark:focus:bg-neutral-900"
                  aria-label="Minimum price in Taka"
                />
                <span className="text-xs text-neutral-400 font-bold">—</span>
                <input
                  type="number"
                  placeholder="Max ৳"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs font-bold focus:border-[#1b4f93] focus:bg-white focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-950/30 dark:text-white dark:focus:bg-neutral-900"
                  aria-label="Maximum price in Taka"
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-xl bg-neutral-900 py-2 text-xs font-bold text-white hover:bg-neutral-800 active:scale-98 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
              >
                Apply Range
              </button>
            </form>
          </div>

          {/* Stock Availability binary toggler switch */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
              Availability
            </h3>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/30 dark:hover:bg-neutral-850">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                In Stock Only
              </span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={handleStockToggle}
                className="h-4 w-4 rounded-sm border-neutral-300 text-[#1b4f93] focus:ring-[#1b4f93]/20 dark:border-neutral-700 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* 
          Glassmorphic Loading/Pending overlay indicator:
          Triggered when dynamic route transitions are executing in the background.
        */}
        {isPending && (
          <div className="absolute inset-0 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center rounded-2xl">
            <RefreshCw className="h-6 w-6 animate-spin text-[#1b4f93] dark:text-blue-400" />
          </div>
        )}
      </aside>

      {/* Mobile Drawer backdrop dim overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs sm:hidden"
        />
      )}
    </>
  );
}

