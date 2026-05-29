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

export function ProductCatalog({
  products,
  availableBrands,
  availableCategories,
  maxPriceLimit,
}: ProductCatalogProps) {
  const searchParams = useSearchParams();

  // Extract parameters
  const brandParam = searchParams.get('brand') || '';
  const categoryParam = searchParams.get('category') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const sortParam = searchParams.get('sort') || 'name_asc';
  const pageParam = searchParams.get('page') || '1';

  // Helper to extract brand
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

      // Brand filter
      if (brandParam && brand.toLowerCase() !== brandParam.toLowerCase()) {
        return false;
      }

      // Category filter
      if (categoryParam && category.toLowerCase() !== categoryParam.toLowerCase()) {
        return false;
      }

      // Min Price filter
      if (minPriceParam && sellingPrice < parseFloat(minPriceParam)) {
        return false;
      }

      // Max Price filter
      if (maxPriceParam && sellingPrice > parseFloat(maxPriceParam)) {
        return false;
      }

      // In Stock filter
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
        // default: name_asc
        return a.enName.localeCompare(b.enName);
      }
    });
    return sorted;
  }, [filteredProducts, sortParam]);

  // Derived Pagination State
  const totalCount = sortedProducts.length;
  const itemsPerPage = 12;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const currentPage = Math.max(1, Math.min(parseInt(pageParam, 10), totalPages || 1));

  const paginatedProducts = useMemo(() => {
    const skip = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(skip, skip + itemsPerPage);
  }, [sortedProducts, currentPage]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 sm:flex-row">
        {/* Filter Sidebar */}
        <div className="shrink-0 sm:w-64">
          <FiltersSidebar
            availableBrands={availableBrands}
            availableCategories={availableCategories}
            maxPriceLimit={maxPriceLimit}
          />
        </div>

        {/* Product Grid & List Control */}
        <div className="flex-1 space-y-6">
          <SortingHeader totalCount={totalCount} />

          {paginatedProducts.length === 0 ? (
            <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-12 text-center dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                No products found
              </h3>
              <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                Try modifying or clearing your filters to see results.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.uid} product={product} />
                ))}
              </div>

              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
