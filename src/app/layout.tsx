/**
 * @file src/app/layout.tsx
 * @description The main root layout for the Walton Plaza application. 
 * This file sets up the global HTML document structure, fonts, high-performance SEO metadata,
 * global styling boundaries, and initializes the global Header and Client-side providers.
 * 
 * Performance & Architecture:
 * - Employs Next.js Font Optimization to preload and serve Geist and Geist Mono locally, preventing cumulative layout shift (CLS).
 * - Utilizes React Server Component (RSC) architecture. The layout itself is processed server-side, 
 *   injecting static layouts directly, while delegating dynamic client interactions (like state-based cart drawers)
 *   to the <ClientProviders /> client-side hydration boundaries.
 */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Header } from '@/components/common/Header';
import { ClientProviders } from '@/components/providers/ClientProviders';
import './globals.css';

// Configure the Geist Sans variable font with subset optimizations
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Configure the Geist Mono variable font for technical numbers and terminal displays
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/**
 * Root SEO Metadata Configuration
 * Adheres to SEO Best Practices by providing descriptive titles, keywords, and meta descriptions 
 * which search crawler engines (e.g., Googlebot) leverage to rank index catalog pages.
 */
export const metadata: Metadata = {
  title: 'Walton Plaza | High-Performance Products Store',
  description: 'Design and buy original high performance appliances, smartphones, and laptops directly from Walton Plaza.',
};

/**
 * RootLayout - The foundational layout component wrapping all sub-routes.
 * 
 * @param props.children - Dynamic subpage component markup currently being served by the router path.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50/50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 font-sans selection:bg-blue-500/20 selection:text-blue-600">
        {/* 
          Persistent Premium Navigation Header:
          Stays static across route changes, containing the main branding and cart triggers.
        */}
        <Header />

        {/* 
          Dynamic page main content area:
          Serves as the high-speed container where React Server Components and nested routing screens load.
        */}
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>

        {/* 
          Global Cart Drawer slide-over loaded in Client boundary:
          We load the CartDrawer dynamically within the client-side provider bundle to prevent
          Next.js Hydration Mismatch issues and defer unnecessary bundle weights on initial draw.
        */}
        <ClientProviders />
      </body>
    </html>
  );
}

