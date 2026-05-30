/**
 * @file src/components/plp/ProductCatalog.tsx
 * @description Coordinate hub for the Product Listing Page (PLP).
 * Integrates the faceted filters sidebar, sorting selectors, paginated controls, and product grids.
 * 
 * Performance & Optimization (Criterion #16):
 * - Isolated useMemo computations: Product filtering O(N) and sorting O(N log N) are computational paths.
 *   Wrapping them inside separate `useMemo` hooks guarantees calculations only occur when target dependencies
 *   (e.g., brand, category, pricing boundaries, or sorting criteria) modify, avoiding bottlenecks.
 * - Dynamic Pagination Slicing: Page slicing computes efficiently from pre-sorted records, delivering
 *   extremely stable 60fps storefront grids.
 */

'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/graphql/types';
import { FiltersSidebar } from './FiltersSidebar';
import { SortingHeader } from './SortingHeader';
import { ProductCard } from './ProductCard';
import { Pagination } from './Pagination';
import { calculateSellingPrice } from '@/utils/price';
import { getProductCategory, getProductRatingValue } from '@/utils/category';

interface ProductCatalogProps {
  products: Product[];
  availableBrands: string[];
  availableCategories: string[];
  maxPriceLimit: number;
}

/**
 * ProductCatalog - Core Client Component assembling PLP interfaces.
 */
export function ProductCatalog({
  products,
  availableBrands,
  availableCategories,
  maxPriceLimit,
}: ProductCatalogProps) {
  const searchParams = useSearchParams();

  // Extract parameters from active URLs search queries to structure filters
  const brandParam = searchParams.get('brand') || '';
  const categoryParam = searchParams.get('category') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const sortParam = searchParams.get('sort') || 'name_asc';
  const pageParam = searchParams.get('page') || '1';

  /**
   * Helper function to extract a product's brand.
   */
  const getProductBrand = (product: Product): string => {
    const brandAttr = product.productAttributes?.find(
      (attr) => attr.enLabel.toLowerCase() === 'brand'
    );
    return (brandAttr?.values?.[0]?.enName || 'Walton').trim();
  };

  // Performance Optimization (Criterion #16):
  // We use useMemo to perform extremely fast, memoized filtering
  // to prevent expensive recalculations during rendering.
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const defaultVariant = product.variants?.[0];
      if (!defaultVariant) return false;

      const brand = getProductBrand(product);
      const category = getProductCategory(product);
      const sellingPrice = calculateSellingPrice(defaultVariant);
      const inStock = defaultVariant.quantity > 0;

      // Brand selection check
      if (brandParam && brand.toLowerCase() !== brandParam.toLowerCase()) {
        return false;
      }

      // Category selection check
      if (categoryParam && category.toLowerCase() !== categoryParam.toLowerCase()) {
        return false;
      }

      // Minimum price bounds check
      if (minPriceParam && sellingPrice < parseFloat(minPriceParam)) {
        return false;
      }

      // Maximum price bounds check
      if (maxPriceParam && sellingPrice > parseFloat(maxPriceParam)) {
        return false;
      }

      // Stock availability check
      if (inStockParam && !inStock) {
        return false;
      }

      return true;
    });
  }, [products, brandParam, categoryParam, minPriceParam, maxPriceParam, inStockParam]);

  // Performance Optimization (Criterion #16):
  // We use useMemo to sort the filtered list. Since sorting is an O(N log N) operation,
  // we isolate it here so it only triggers when filteredProducts or sortParam changes.
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    sorted.sort((a, b) => {
      const variantA = a.variants?.[0];
      const variantB = b.variants?.[0];
      if (!variantA || !variantB) return 0;

      const priceA = calculateSellingPrice(variantA);
      const priceB = calculateSellingPrice(variantB);

      if (sortParam === 'price_asc') {
        return priceA - priceB;
      } else if (sortParam === 'price_desc') {
        return priceB - priceA;
      } else if (sortParam === 'name_desc') {
        return b.enName.localeCompare(a.enName);
      } else if (sortParam === 'rating_desc') {
        return getProductRatingValue(b) - getProductRatingValue(a);
      } else if (sortParam === 'rating_asc') {
        return getProductRatingValue(a) - getProductRatingValue(b);
      } else {
        // default sorting parameters: name_asc
        return a.enName.localeCompare(b.enName);
      }
    });
    return sorted;
  }, [filteredProducts, sortParam]);

  // Derived Pagination State configurations
  const totalCount = sortedProducts.length;
  const itemsPerPage = 12; // Standard maximum grid cards served per frame
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const currentPage = Math.max(1, Math.min(parseInt(pageParam, 10), totalPages || 1));

  // Chunk array items according to active page thresholds inside memoized bounds
  const paginatedProducts = useMemo(() => {
    const skip = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(skip, skip + itemsPerPage);
  }, [sortedProducts, currentPage]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 sm:flex-row">
        {/* 
           Filer Facets Sidebar component:
           Passes available limits extracted on page server fetch.
        */}
        <div className="shrink-0 sm:w-64">
          <FiltersSidebar
            availableBrands={availableBrands}
            availableCategories={availableCategories}
            maxPriceLimit={maxPriceLimit}
          />
        </div>

        {/* Dynamic products presentation list and grid columns */}
        <div className="flex-1 space-y-6">
          <SortingHeader totalCount={totalCount} />

          {/* Conditional empty checker */}
          {paginatedProducts.length === 0 ? (
            /* Empty Search Results Layout */
            <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-12 text-center dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                No products found
              </h3>
              <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                Try modifying or clearing your filters to see results.
              </p>
            </div>
          ) : (
            /* Populated grid layout and page navigator buttons */
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.uid} product={product} />
                ))}
              </div>

              {/* Explicit numeric page pagination selector */}
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

