'use client';

import { useTransition, useOptimistic, useState } from 'react';
import { ShoppingBag, Check, Info, ShieldCheck, Truck } from 'lucide-react';
import { Product, ProductVariant } from '@/graphql/types';
import { useCartStore } from '@/store/useCartStore';
import { calculateSellingPrice, formatPrice, getDiscountBadgeLabel, calculateSavings } from '@/utils/price';
import { getVariantLabel } from '@/utils/category';
import { cn } from '@/utils/cn';

interface VariantSelectorProps {
  product: Product;
}

export function VariantSelector({ product }: VariantSelectorProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isPending, startTransition] = useTransition();

  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const variants = product.variants || [];
  const selectedVariant: ProductVariant | undefined = variants[selectedIdx];

  // React 19 Optimistic state for the button feedback
  const [optimisticState, setOptimisticState] = useOptimistic(
    'idle' as 'idle' | 'adding' | 'added',
    (_current, newState: 'idle' | 'adding' | 'added') => newState
  );

  if (!selectedVariant) {
    return (
      <div className="rounded-2xl border border-neutral-100 bg-amber-50 p-4 text-xs font-semibold text-amber-700 dark:border-neutral-800 dark:bg-amber-950/20 dark:text-amber-400">
        Pricing or variant information is currently unavailable for this item.
      </div>
    );
  }

  const sellingPrice = calculateSellingPrice(selectedVariant);
  const mrpPrice = selectedVariant.mrpPrice;
  const discount = selectedVariant.discount;
  const stock = selectedVariant.quantity;
  const isOutOfStock = stock <= 0;
  
  const discountLabel = getDiscountBadgeLabel(discount);
  const showDiscount = discount && discountLabel && sellingPrice < mrpPrice;
  const savings = calculateSavings(selectedVariant);

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    startTransition(async () => {
      setOptimisticState('adding');
      
      // Simulate fast network validation for premium UX feedback
      await new Promise((resolve) => setTimeout(resolve, 350));
      
      addItem({
        uid: product.uid,
        enName: product.enName,
        imageUrl: product.images?.[0]?.url || '',
        posItemCode: selectedVariant.posItemCode,
        ebsItemCode: selectedVariant.ebsItemCode,
        mrpPrice,
        sellingPrice,
        discount,
        stockQuantity: stock,
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

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Pricing Section - aria-live polite will read price changes aloud */}
      <div 
        className="flex flex-col gap-1.5 border-b border-neutral-100 pb-5 dark:border-neutral-800"
        aria-live="polite"
      >
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black tracking-tight text-neutral-950 dark:text-white">
            {formatPrice(sellingPrice)}
          </span>
          {showDiscount && (
            <>
              <span className="text-sm font-semibold text-neutral-400 line-through">
                {formatPrice(mrpPrice)}
              </span>
              <span className="sr-only">Original price was {formatPrice(mrpPrice)}</span>
            </>
          )}
        </div>

        {showDiscount && (
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="rounded-full bg-[#da251c]/10 px-2.5 py-0.5 text-xs font-bold text-[#da251c] dark:bg-red-500/20 dark:text-red-400">
              {discountLabel}
            </span>
            <span className="text-xs font-extrabold text-[#da251c] dark:text-red-400">
              Save {formatPrice(savings)}
            </span>
          </div>
        )}
      </div>

      {/* Variant Selector Pills if multiple variants exist */}
      {variants.length > 1 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Select Option / Variant
          </h4>
          <div 
            className="flex flex-wrap gap-2.5" 
            role="tablist"
            aria-label="Product variations and prices"
          >
            {variants.map((v, idx) => {
              const vPrice = calculateSellingPrice(v);
              const vOutOfStock = v.quantity <= 0;
              const isSelected = selectedIdx === idx;

              return (
                <button
                  key={`${v.posItemCode}-${idx}`}
                  onClick={() => setSelectedIdx(idx)}
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={`Variant ${getVariantLabel(v, product, idx)}: code ${v.posItemCode}, price ${formatPrice(vPrice)}, ${vOutOfStock ? 'Sold Out' : 'In stock'}`}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-200 hover:scale-[1.02] active:scale-98 min-w-[120px] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1b4f93] cursor-pointer",
                    isSelected
                      ? "border-[#1b4f93] bg-[#1b4f93]/5 ring-1 ring-[#1b4f93] dark:border-blue-500 dark:bg-blue-500/10 dark:ring-blue-500"
                      : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                  )}
                >
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">
                    {getVariantLabel(v, product, idx)}
                  </span>
                  <span className="text-xs font-black text-neutral-800 dark:text-white mt-0.5">
                    {formatPrice(vPrice)}
                  </span>
                  <span className={cn(
                    "text-[9px] font-bold mt-1",
                    vOutOfStock
                      ? "text-rose-500"
                      : v.quantity <= 5
                      ? "text-amber-500"
                      : "text-neutral-400"
                  )}>
                    {vOutOfStock ? 'Sold Out' : v.quantity <= 5 ? `Only ${v.quantity} left` : 'In Stock'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock indicators */}
      <div className="flex items-center gap-2">
        <div 
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            isOutOfStock ? "bg-[#da251c]" : stock <= 5 ? "bg-amber-500" : "bg-emerald-500"
          )} 
          aria-hidden="true"
        />
        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
          {isOutOfStock
            ? 'Out of Stock (Currently Unavailable)'
            : stock <= 5
            ? `Limited Stock: Only ${stock} units remaining!`
            : `In Stock & Ready to Ship (Quantity: ${stock})`}
        </span>
      </div>

      {/* Buy Actions using React 19 transitions and useOptimistic */}
      <div className="mt-4 flex flex-col gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || optimisticState === 'adding'}
          aria-label={
            isOutOfStock 
              ? `Product is sold out` 
              : optimisticState === 'added' 
              ? `Item added to cart successfully` 
              : `Add selected variant to cart`
          }
          className={cn(
            "flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-black transition-all duration-300 active:scale-98 shadow-md cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1b4f93]/80",
            isOutOfStock
              ? "cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 shadow-none"
              : optimisticState === 'adding'
              ? "bg-[#1b4f93]/10 text-[#1b4f93] dark:bg-[#1b4f93]/20 dark:text-blue-400 shadow-none"
              : optimisticState === 'added'
              ? "bg-emerald-600 text-white shadow-emerald-500/20"
              : "bg-[#1b4f93] text-white shadow-[#1b4f93]/10 hover:bg-[#153e74] hover:shadow-lg hover:shadow-[#1b4f93]/20 dark:bg-[#1b4f93] dark:hover:bg-[#153e74]"
          )}
        >
          {isOutOfStock ? (
            'Out of Stock'
          ) : optimisticState === 'adding' ? (
            <>
              <svg className="h-5 w-5 animate-spin text-[#1b4f93] dark:text-blue-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Adding Item...</span>
            </>
          ) : optimisticState === 'added' ? (
            <>
              <Check className="h-5 w-5" aria-hidden="true" />
              <span>Item Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        {/* Micro reassurance info */}
        <div className="grid grid-cols-2 gap-4 mt-6 border-t border-neutral-100 pt-5 dark:border-neutral-800 text-neutral-400">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#1b4f93] dark:text-blue-400 shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Fast Plaza Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#1b4f93] dark:text-blue-400 shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider">100% Original Brand</span>
          </div>
        </div>
      </div>
    </div>
  );
}
