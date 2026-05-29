import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductDiscount } from '@/graphql/types';

export interface CartItem {
  uid: string;                 // Product UID
  enName: string;              // Product title
  imageUrl: string;            // Product image
  posItemCode: string;         // Unique Variant POS code
  ebsItemCode: string;         // Unique Variant EBS code
  mrpPrice: number;            // Original price
  sellingPrice: number;        // Price after discount
  discount: ProductDiscount | null;
  quantity: number;            // Selected quantity
  stockQuantity: number;       // Available stock quantity
}

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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem, quantity = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (item) => item.posItemCode === newItem.posItemCode
        );

        if (existingIndex > -1) {
          const existingItem = items[existingIndex];
          // Limit by available stock
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
          // Verify stock exists before adding
          if (newItem.stockQuantity <= 0) return;
          
          const newQty = Math.min(quantity, newItem.stockQuantity);
          set({
            items: [...items, { ...newItem, quantity: newQty }],
          });
        }
      },

      removeItem: (posItemCode) => {
        set({
          items: get().items.filter((item) => item.posItemCode !== posItemCode),
        });
      },

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

      clearCart: () => {
        set({ items: [] });
      },

      setCartOpen: (isOpen) => {
        set({ isOpen });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },
    }),
    {
      name: 'walton-plaza-cart', // local storage key
    }
  )
);
