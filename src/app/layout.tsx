import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Header } from '@/components/common/Header';
import { ClientProviders } from '@/components/providers/ClientProviders';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Walton Plaza | High-Performance Products Store',
  description: 'Design and buy original high performance appliances, smartphones, and laptops directly from Walton Plaza.',
};

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
        {/* Persistent Premium Navigation Header */}
        <Header />

        {/* Dynamic page main content area */}
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>

        {/* Global Cart Drawer slide-over loaded in Client boundary */}
        <ClientProviders />
      </body>
    </html>
  );
}
