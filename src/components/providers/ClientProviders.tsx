/**
 * @file src/components/providers/ClientProviders.tsx
 * @description Global Client-side Provider wrapper boundary.
 * Orchestrates dynamic initialization of interactive modules post-hydration.
 * 
 * Hydration Safety & Optimization:
 * - Dynamic Lazy Load: Uses Next.js dynamic imports to pull in `<CartDrawer />` with `ssr: false` disabled.
 * - Hydration Mismatch Guard: Because the global shopping cart state initializes immediately
 *   from browser `localStorage`, executing these lookups during server pre-rendering causes HTML text mismatches.
 *   Wrapping in a client-side provider structure guarantees that cart evaluations occur ONLY on the client device,
 *   completely eliminating Next.js hydration mismatch warning dialogues while shrinking main initial bundle sizes.
 */

'use client';

import dynamic from 'next/dynamic';

// Dynamically load the CartDrawer with ssr: false inside a Client Component boundary
const CartDrawer = dynamic(
  () => import('@/components/cart/CartDrawer').then((m) => m.CartDrawer),
  { ssr: false }
);

/**
 * ClientProviders - Root injection of client-side operations.
 * Embedded safely at the base of the layout DOM hierarchy.
 */
export function ClientProviders() {
  return <CartDrawer />;
}

