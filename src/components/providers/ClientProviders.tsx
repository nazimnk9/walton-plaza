'use client';

import dynamic from 'next/dynamic';

// Dynamically load the CartDrawer with ssr: false inside a Client Component boundary
const CartDrawer = dynamic(
  () => import('@/components/cart/CartDrawer').then((m) => m.CartDrawer),
  { ssr: false }
);

export function ClientProviders() {
  return <CartDrawer />;
}
