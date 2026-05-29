'use client';

import { useTransition, useOptimistic, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, Percent, Check } from 'lucide-react';
import { Product } from '@/graphql/types';
import { useCartStore } from '@/store/useCartStore';
import { calculateSellingPrice, formatPrice, getDiscountBadgeLabel } from '@/utils/price';
import { getProductRatingValue } from '@/utils/category';
import { cn } from '@/utils/cn';

interface ProductCardProps {
  product: Product;
}

// Memoized ProductCard to prevent parent-driven layout redraws across listing grids
export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const [isPending, startTransition] = useTransition();
  
  // Zustand store actions
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);

  // Default to first variant
  const defaultVariant = product.variants?.[0];
  const sellingPrice = defaultVariant ? calculateSellingPrice(defaultVariant) : 0;
  const mrpPrice = defaultVariant ? defaultVariant.mrpPrice : 0;
  const discount = defaultVariant ? defaultVariant.discount : null;
  const stock = defaultVariant ? defaultVariant.quantity : 0;
  const isOutOfStock = stock <= 0;

  // React 19 Optimistic state for the button feedback
  const [optimisticState, setOptimisticState] = useOptimistic(
    'idle' as 'idle' | 'adding' | 'added',
    (_current, newState: 'idle' | 'adding' | 'added') => newState
  );

  // Fallback placeholder image (premium SVG base64)
  const fallbackImage = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="%239ca3af">No Image Available</text></svg>`;

  const imageUrl = product.images?.[0]?.url || fallbackImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock || !defaultVariant) return;

    startTransition(async () => {
      setOptimisticState('adding');
      
      // Simulate fast network validation for premium UX feedback
      await new Promise((resolve) => setTimeout(resolve, 350));
      
      addItem({
        uid: product.uid,
        enName: product.enName,
        imageUrl: product.images?.[0]?.url || '',
        posItemCode: defaultVariant.posItemCode,
        ebsItemCode: defaultVariant.ebsItemCode,
        mrpPrice: defaultVariant.mrpPrice,
        sellingPrice,
        discount,
        stockQuantity: defaultVariant.quantity,
      });

      setOptimisticState('added');
      toggleCart();

      setTimeout(() => {
        startTransition(() => {
          setOptimisticState('idle');
        });
      }, 1500);
    });
  };

  const discountLabel = getDiscountBadgeLabel(discount);
  const showDiscount = discount && discountLabel && sellingPrice < mrpPrice;

  return (
    <article className="flex flex-col h-full">
      <Link
        href={`/products/${product.uid}`}
        aria-label={`View specifications and detailed information for ${product.enName}`}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1b4f93]/20 hover:shadow-xl hover:shadow-[#1b4f93]/5 focus-visible:ring-2 focus-visible:ring-[#1b4f93] focus-visible:outline-hidden dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-[#1b4f93]/30 flex-1"
      >
        {/* Badge container */}
        <div className="absolute top-5 left-5 z-10 flex flex-col gap-1.5">
          {showDiscount && (
            <span 
              className="flex items-center gap-1 rounded-full bg-[#da251c] px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-md shadow-red-500/20"
              aria-label={`Discount: ${discountLabel}`}
            >
              <Percent className="h-3 w-3 animate-pulse" aria-hidden="true" />
              {discountLabel}
            </span>
          )}
          
          {isOutOfStock ? (
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              Out of Stock
            </span>
          ) : stock <= 5 ? (
            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              Only {stock} Left
            </span>
          ) : null}
        </div>

        {/* Product Image Gallery with Zoom */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-50 dark:bg-neutral-950">
          <Image
            src={imageUrl}
            alt={`Image of ${product.enName}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-108"
            priority={false}
          />
          {/* Quick View Hover Overlay */}
          <div className="absolute inset-0 bg-neutral-900/20 opacity-0 backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-800 shadow-md transition-all duration-300 hover:scale-110 hover:bg-blue-600 hover:text-white dark:bg-neutral-800 dark:text-white dark:hover:bg-blue-500">
              <Eye className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Quick View details</span>
            </span>
          </div>
        </div>

        {/* Product Information */}
        <div className="mt-3 flex flex-1 flex-col justify-between">
          <div>
            {/* Attributes short representation if available */}
            <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              <span>{product.productAttributes?.[0]?.values?.[0]?.enName || 'Walton Plaza'}</span>
              <span className="flex items-center gap-0.5 text-amber-500 font-extrabold" aria-label={`Rating: ${getProductRatingValue(product).toFixed(1)} stars`}>
                ★ {getProductRatingValue(product).toFixed(1)}
              </span>
            </div>

            {/* Title */}
            <h3 className="mt-1 line-clamp-2 text-sm font-semibold tracking-tight text-neutral-800 group-hover:text-[#1b4f93] transition-colors duration-200 dark:text-neutral-100 dark:group-hover:text-blue-400">
              {product.enName}
            </h3>
          </div>

          {/* Pricing & Cart Action */}
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-white">
                {formatPrice(sellingPrice)}
              </span>
              {showDiscount && (
                <>
                  <span className="text-xs font-semibold text-neutral-400 line-through">
                    {formatPrice(mrpPrice)}
                  </span>
                  <span className="sr-only">Original price was {formatPrice(mrpPrice)}</span>
                </>
              )}
            </div>

            {/* Action Button using React 19 Optimistic state */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || optimisticState === 'adding'}
              aria-label={
                isOutOfStock 
                  ? `${product.enName} is sold out` 
                  : optimisticState === 'added' 
                  ? `${product.enName} added to cart successfully` 
                  : `Add ${product.enName} to cart`
              }
              className={cn(
                "mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1b4f93]/85 active:scale-98 cursor-pointer",
                isOutOfStock
                  ? "cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                  : optimisticState === 'adding'
                  ? "bg-[#1b4f93]/10 text-[#1b4f93] dark:bg-[#1b4f93]/20 dark:text-blue-400"
                  : optimisticState === 'added'
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-[#1b4f93] text-white shadow-md shadow-[#1b4f93]/10 hover:bg-[#153e74] hover:shadow-lg hover:shadow-[#1b4f93]/20 dark:bg-[#1b4f93] dark:hover:bg-[#153e74]"
              )}
            >
              {isOutOfStock ? (
                'Sold Out'
              ) : optimisticState === 'adding' ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-[#1b4f93] dark:text-blue-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Adding...</span>
                </>
              ) : optimisticState === 'added' ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
});
