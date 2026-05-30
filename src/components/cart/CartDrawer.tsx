/**
 * @file src/components/cart/CartDrawer.tsx
 * @description Interactive Client Component rendering the slide-over shopping cart.
 * Displays selected product variants, manages stock limits, calculates discounts,
 * and allows cart modification/checkout simulation.
 * 
 * Performance & Rendering:
 * - Next.js Deferred Hydration: Loaded dynamically with `ssr: false` in `<ClientProviders />`
 *   to bypass server pre-rendering of localStorage state, avoiding Hydration Mismatch issues.
 * - Reactive Selector Subscriptions: Maps strictly to needed actions and item states from Zustand.
 */

'use client';

import { useCartStore } from '@/store/useCartStore';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/utils/price';
import { cn } from '@/utils/cn';

/**
 * CartDrawer - Dynamic shopping cart sliding panel overlay.
 */
export function CartDrawer() {
  // Subscribe to specific Zustand store states and action dispatchers
  const isOpen = useCartStore((state) => state.isOpen);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  // Calculate pricing subtotals based on original Manufacturer Suggested Retail Prices (MRP)
  const subtotal = items.reduce((sum, item) => sum + item.mrpPrice * item.quantity, 0);

  // Calculate dynamic savings sums by finding the delta between MRP and actual dynamic selling pricing
  const totalSavings = items.reduce(
    (sum, item) => sum + (item.mrpPrice - item.sellingPrice) * item.quantity,
    0
  );

  // Calculate grand total actual checkout payable amounts
  const total = subtotal - totalSavings;

  // Placeholder SVG data URI to display if a product variant lacks an image URL
  const fallbackImage = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="8" fill="%239ca3af">No Image</text></svg>`;

  return (
    <>
      {/* 
        Slide-over Panel container:
        Utilizes absolute fixed screen alignments, sliding leftwards when isOpen triggers.
      */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-neutral-900 border-l border-neutral-100 dark:border-neutral-800",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Cart Drawer Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#1b4f93] dark:text-blue-400" />
            <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
              Shopping Cart
            </h2>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-500 dark:hover:bg-neutral-800 cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area - Conditional rendering based on item count */}
        {items.length === 0 ? (
          /* Empty Cart State Layout */
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400 dark:bg-neutral-950/30">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-neutral-900 dark:text-white">Your cart is empty</h3>
            <p className="mt-2 text-xs font-semibold text-neutral-400 max-w-xs dark:text-neutral-500">
              Add products from the listing page or product details to see them appear here.
            </p>
            <button
              onClick={() => setCartOpen(false)}
              className="mt-6 rounded-xl bg-[#1b4f93] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#1b4f93]/10 hover:bg-[#153e74] dark:bg-[#1b4f93] dark:hover:bg-[#153e74] cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Populated Cart State Layout */
          <>
            {/* Scrollable list containing individual selected items */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 p-6 space-y-4 dark:divide-neutral-800">
              {items.map((item) => (
                <div key={item.posItemCode} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  {/* Variant Thumbnail Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-50 p-1 dark:bg-neutral-950">
                    <Image
                      src={item.imageUrl || fallbackImage}
                      alt={item.enName}
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Item Description, codes, and deletion triggers */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.uid}`}
                          onClick={() => setCartOpen(false)}
                          className="line-clamp-2 text-xs font-bold text-neutral-800 hover:text-[#1b4f93] dark:text-neutral-100 dark:hover:text-blue-400"
                        >
                          {item.enName}
                        </Link>
                        <button
                          onClick={() => removeItem(item.posItemCode)}
                          className="text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                          aria-label={`Remove ${item.enName} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Code: {item.posItemCode}
                      </p>
                    </div>

                    {/* Quantity bounds controller controls & Variant Price displays */}
                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Selector controls */}
                      <div className="flex items-center gap-1 bg-neutral-50 rounded-lg p-1 dark:bg-neutral-950">
                        {/* Decrement quantity unit */}
                        <button
                          onClick={() => updateQuantity(item.posItemCode, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 dark:hover:bg-neutral-900 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-neutral-800 dark:text-white">
                          {item.quantity}
                        </span>
                        {/* Increment quantity unit up to available inventory */}
                        <button
                          onClick={() => updateQuantity(item.posItemCode, item.quantity + 1)}
                          disabled={item.quantity >= item.stockQuantity}
                          className="p-1 rounded-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 dark:hover:bg-neutral-900 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Display total items pricing details */}
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-neutral-950 dark:text-white">
                          {formatPrice(item.sellingPrice * item.quantity)}
                        </div>
                        {item.sellingPrice < item.mrpPrice && (
                          <div className="text-[10px] font-semibold text-neutral-400 line-through">
                            {formatPrice(item.mrpPrice * item.quantity)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Checkout Summary & checkout button actions */}
            <div className="border-t border-neutral-100 bg-neutral-50/50 p-6 dark:border-neutral-800 dark:bg-neutral-950/20">
              <div className="space-y-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal (MRP)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-[#da251c] dark:text-red-400">
                    <span>Discount Savings</span>
                    <span>-{formatPrice(totalSavings)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-neutral-200/60 pt-3 text-sm font-black text-neutral-950 dark:border-neutral-800 dark:text-white">
                  <span>Grand Total</span>
                  <span className="text-base font-black tracking-tight">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => alert('Order Placed Successfully! (Simulation)')}
                  className="w-full rounded-xl bg-[#1b4f93] py-3 text-sm font-bold text-white shadow-lg shadow-[#1b4f93]/10 hover:bg-[#153e74] active:scale-98 dark:bg-[#1b4f93] dark:hover:bg-[#153e74] cursor-pointer"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="w-full rounded-xl border border-neutral-200 py-2.5 text-xs font-bold text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 
        Blurry Drawer Backdrop:
        Displayed when the drawer is open. Clicking it safely dismisses the modal drawer view.
      */}
      {isOpen && (
        <div
          onClick={() => setCartOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        />
      )}
    </>
  );
}

