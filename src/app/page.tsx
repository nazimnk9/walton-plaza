import { Metadata } from 'next';
import { serverGetProducts } from '@/graphql/client';
import { ProductCard } from '@/components/plp/ProductCard';
import { FiltersSidebar } from '@/components/plp/FiltersSidebar';
import { SortingHeader } from '@/components/plp/SortingHeader';
import { Pagination } from '@/components/plp/Pagination';
import { calculateSellingPrice } from '@/utils/price';
import { Product } from '@/graphql/types';

export const metadata: Metadata = {
  title: 'Walton Plaza | High-Performance Products Catalog',
  description: 'Explore the complete Walton Plaza products catalog. Order original electronics with high performance specifications and best-in-market rates.',
};

interface PageProps {
  searchParams: Promise<{
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
    page?: string;
  }>;
}

// Utility to extract brand from product attributes
function getProductBrand(product: Product): string {
  const brandAttr = product.productAttributes?.find(
    (attr) => attr.enLabel.toLowerCase() === 'brand'
  );
  const brandVal = brandAttr?.values?.[0]?.enName || 'Walton';
  return brandVal.trim();
}

export default async function ProductListingPage(props: PageProps) {
  // Await searchParams as required by Next.js 15+ App Router
  const searchParams = await props.searchParams;

  const brandParam = searchParams.brand || '';
  const minPriceParam = searchParams.minPrice || '';
  const maxPriceParam = searchParams.maxPrice || '';
  const inStockParam = searchParams.inStock === 'true';
  const sortParam = searchParams.sort || 'name_asc';
  const pageParam = searchParams.page || '1';

  // Fetch all active products on the server.
  // We request up to 100 products to enable extremely fast server-side in-memory filtering.
  const { products, statusCode, message } = await serverGetProducts({
    pagination: { skip: 0, limit: 100 },
    filter: { isActive: true },
  });

  // Extract unique brands for the filter sidebar from the raw database query
  const availableBrands = Array.from(
    new Set(products.map((p) => getProductBrand(p)))
  ).filter(Boolean).sort();

  // Handle API connection errors gracefully
  if (statusCode !== 200) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <div className="rounded-2xl bg-rose-50 p-6 dark:bg-rose-950/20 max-w-md">
          <h2 className="text-base font-black text-rose-800 dark:text-rose-400">
            Database Sync Failure
          </h2>
          <p className="mt-2 text-xs font-semibold text-rose-600/80 dark:text-rose-400/85">
            Unable to fetch product listings. Error: {message} (Status {statusCode})
          </p>
          <button
            onClick={() => {}}
            className="mt-6 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-rose-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Calculate maximum price limit dynamically for filtering
  const maxPriceLimit = products.reduce((max, p) => {
    const defaultVariant = p.variants?.[0];
    const price = defaultVariant ? calculateSellingPrice(defaultVariant) : 0;
    return price > max ? price : max;
  }, 0);

  // Apply filters on the server dataset in-memory
  let filteredProducts = products.filter((product) => {
    const defaultVariant = product.variants?.[0];
    if (!defaultVariant) return false;

    const brand = getProductBrand(product);
    const sellingPrice = calculateSellingPrice(defaultVariant);
    const inStock = defaultVariant.quantity > 0;

    // Brand filter
    if (brandParam && brand.toLowerCase() !== brandParam.toLowerCase()) {
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

  // Apply sorting
  filteredProducts.sort((a, b) => {
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
    } else {
      // default: name_asc
      return a.enName.localeCompare(b.enName);
    }
  });

  // Pagination bounds
  const totalCount = filteredProducts.length;
  const itemsPerPage = 12;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const currentPage = Math.max(1, Math.min(parseInt(pageParam, 10), totalPages));
  
  const skip = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(skip, skip + itemsPerPage);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 sm:flex-row">
        {/* Filter Sidebar */}
        <div className="shrink-0 sm:w-64">
          <FiltersSidebar
            availableBrands={availableBrands}
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

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
