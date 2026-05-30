/**
 * @file src/components/common/Header.tsx
 * @description The persistent storefront navigation header.
 * Encapsulates the main corporate branding link and dynamic shopping cart button trigger.
 * 
 * Performance & Design:
 * - Uses Next.js Client Component directives since it binds toggle callback states.
 * - Selective Rendering: Subscribes strictly to `toggleCart` and `items` to compute
 *   badge counts. Re-renders only when cart contents adjust, bypassing main layout redraws.
 * - Backdrop Blur: Styled with standard glassmorphic CSS rules (`backdrop-blur-md bg-white/80`).
 */

'use client';

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';

/**
 * Header - Sticky navigation bar displayed at the top of all pages.
 */
export function Header() {
  // Subscribe to Zustand reactive cart parameters
  const toggleCart = useCartStore((state) => state.toggleCart);
  const items = useCartStore((state) => state.items);
  
  // Calculate total checkout items count recursively for screen badge updates
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100/80 bg-white/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Walton Plaza Brand Link & Logo */}
        <Link href="/" className="flex items-center group" aria-label="Walton Plaza Home">
          {/* Official Logo Image provided by the User */}
          <div className="relative h-18 w-32 shrink-0">
            <Image
              src="/logo.jpg"
              alt="Walton Plaza Logo"
              fill
              priority
              sizes="128px"
              className="object-contain group-hover:scale-102 transition-transform duration-300 rounded-md bg-white p-0.5"
            />
          </div>
        </Link>

        {/* Global Cart Toggles Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleCart}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 shadow-xs transition-all hover:bg-neutral-50 hover:text-[#1b4f93] dark:border-neutral-800 dark:bg-neutral-950/30 dark:text-neutral-300 dark:hover:text-blue-400"
            aria-label={`Open Cart, contains ${totalCount} items`}
          >
            <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
            
            {/* Dynamic quantity circular counter badge */}
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#da251c] text-[10px] font-black text-white shadow-md shadow-red-500/20 animate-in zoom-in duration-200">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

