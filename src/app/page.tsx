import { Metadata } from 'next';
import { serverGetProducts } from '@/graphql/client';
import { ProductCatalog } from '@/components/plp/ProductCatalog';
import { calculateSellingPrice } from '@/utils/price';
import { getProductCategory } from '@/utils/category';
import { Product } from '@/graphql/types';

export const metadata: Metadata = {
  title: 'Walton Plaza | High-Performance Products Catalog',
  description: 'Explore the complete Walton Plaza products catalog. Order original electronics with high performance specifications and best-in-market rates.',
};

function getProductBrand(product: Product): string {
  const brandAttr = product.productAttributes?.find(
    (attr) => attr.enLabel.toLowerCase() === 'brand'
  );
  return (brandAttr?.values?.[0]?.enName || 'Walton').trim();
}

export default async function ProductListingPage() {
  // Fetch all active products on the server.
  // We request up to 100 products to enable extremely fast server-side data retrieve.
  const { products, statusCode, message } = await serverGetProducts({
    pagination: { skip: 0, limit: 100 },
    filter: { isActive: true },
  });

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
        </div>
      </div>
    );
  }

  // Extract unique brands for the filter sidebar dynamically
  const availableBrands = Array.from(
    new Set(products.map((p) => getProductBrand(p)))
  ).filter(Boolean).sort();

  // Extract unique categories for the filter sidebar dynamically
  const availableCategories = Array.from(
    new Set(products.map((p) => getProductCategory(p)))
  ).filter(Boolean).sort();

  // Calculate maximum price limit dynamically for filtering
  const maxPriceLimit = products.reduce((max, p) => {
    const defaultVariant = p.variants?.[0];
    const price = defaultVariant ? calculateSellingPrice(defaultVariant) : 0;
    return price > max ? price : max;
  }, 0);

  return (
    <ProductCatalog
      products={products}
      availableBrands={availableBrands}
      availableCategories={availableCategories}
      maxPriceLimit={maxPriceLimit}
    />
  );
}
