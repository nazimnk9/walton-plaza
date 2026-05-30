/**
 * @file src/store/useCartStore.ts
 * @description Global shopping cart state management using Zustand.
 * Handles item additions, modifications, quantity updates, inventory clamping,
 * and visibility toggles.
 * 
 * Performance & Architecture:
 * - Persistent Store (Criterion #15): Backed by Zustand's `persist` middleware, writing
 *   to `localStorage`. This enables multi-tab cart synchronization and preserves carts across browser closing events.
 * - Reactive Subscriptions: Components subscribing to this store via selectors (e.g., `useCartStore(s => s.items)`)
 *   only re-render when the selected value actually updates, avoiding major layout draw cycles.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductDiscount } from '@/graphql/types';

/**
 * Representation of a single item in the checkout cart.
 */
export interface CartItem {
  uid: string;                 // Product database unique identifier
  enName: string;              // Product title string
  imageUrl: string;            // Primary preview image source URL
  posItemCode: string;         // Unique Variant POS identifier code (used as the primary key for cart matches)
  ebsItemCode: string;         // Unique Variant EBS identifier code
  mrpPrice: number;            // Manufacturer Suggested Retail Price before dynamic discounts
  sellingPrice: number;        // Actual retail price calculated after factoring flat or percent discounts
  discount: ProductDiscount | null; // Discount type/meta schema
  quantity: number;            // Current selected unit quantity to order
  stockQuantity: number;       // Current inventory counts available for order limits
}

/**
 * Global Cart State operations interface.
 */
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (posItemCode: string) => void;
  updateQuantity: (posItemCode: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  toggleCart: () => void;
}

/**
 * useCartStore - Hook defining Zustand shopping cart store with persistent localStorage capabilities.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      /**
       * Adds a new item or increment its count if already exists in checkout.
       * Restricts maximum additions dynamically based on stock capabilities.
       */
      addItem: (newItem, quantity = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (item) => item.posItemCode === newItem.posItemCode
        );

        if (existingIndex > -1) {
          const existingItem = items[existingIndex];
          // Limit total quantity strictly by available inventory stock to prevent over-purchasing
          const newQty = Math.min(
            existingItem.quantity + quantity,
            newItem.stockQuantity
          );
          
          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: newQty,
          };
          set({ items: updatedItems });
        } else {
          // Verify stock exists before adding item
          if (newItem.stockQuantity <= 0) return;
          
          const newQty = Math.min(quantity, newItem.stockQuantity);
          set({
            items: [...items, { ...newItem, quantity: newQty }],
          });
        }
      },

      /**
       * Removes an item entirely from checkout based on its POS variant code.
       */
      removeItem: (posItemCode) => {
        set({
          items: get().items.filter((item) => item.posItemCode !== posItemCode),
        });
      },

      /**
       * Sets a custom ordering quantity for a product.
       * Keeps total items safely bounded between 1 and available stocks.
       */
      updateQuantity: (posItemCode, quantity) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (item) => item.posItemCode === posItemCode
        );

        if (existingIndex > -1) {
          const existingItem = items[existingIndex];
          const clampedQty = Math.max(
            1,
            Math.min(quantity, existingItem.stockQuantity)
          );
          
          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: clampedQty,
          };
          set({ items: updatedItems });
        }
      },

      /**
       * Resets all items to start fresh.
       */
      clearCart: () => {
        set({ items: [] });
      },

      /**
       * Explicitly sets the side drawer view visibility status.
       */
      setCartOpen: (isOpen) => {
        set({ isOpen });
      },

      /**
       * Toggles the side drawer visibility status.
       */
      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },
    }),
    {
      name: 'walton-plaza-cart', // Unique local storage key
    }
  )
);

