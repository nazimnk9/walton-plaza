'use client';

import { useCartStore } from '@/store/useCartStore';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/utils/price';
import { cn } from '@/utils/cn';

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  // Math Calculations
  const subtotal = items.reduce((sum, item) => sum + item.mrpPrice * item.quantity, 0);
  const totalSavings = items.reduce(
    (sum, item) => sum + (item.mrpPrice - item.sellingPrice) * item.quantity,
    0
  );
  const total = subtotal - totalSavings;

  const fallbackImage = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="8" fill="%239ca3af">No Image</text></svg>`;

  return (
    <>
      {/* Slide-over */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-neutral-900 border-l border-neutral-100 dark:border-neutral-800",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
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
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
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
          <>
            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 p-6 space-y-4 dark:divide-neutral-800">
              {items.map((item) => (
                <div key={item.posItemCode} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-50 p-1 dark:bg-neutral-950">
                    <Image
                      src={item.imageUrl || fallbackImage}
                      alt={item.enName}
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Details */}
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
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Code: {item.posItemCode}
                      </p>
                    </div>

                    {/* Pricing & controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-neutral-50 rounded-lg p-1 dark:bg-neutral-950">
                        <button
                          onClick={() => updateQuantity(item.posItemCode, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 dark:hover:bg-neutral-900 cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-neutral-800 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.posItemCode, item.quantity + 1)}
                          disabled={item.quantity >= item.stockQuantity}
                          className="p-1 rounded-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 dark:hover:bg-neutral-900 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

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

            {/* Footer Summary */}
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

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setCartOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        />
      )}
    </>
  );
}
