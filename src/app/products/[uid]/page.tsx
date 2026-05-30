/**
 * @file src/app/products/[uid]/page.tsx
 * @description Product Details Page (PDP) dynamic Server Component.
 * Fetches specific product data on the server based on the dynamic `[uid]` route parameter.
 * 
 * Features & Design Strategy:
 * - Dual Resolution (Criterion #11): Attempts to fetch the product by either its unique identifier (`uid`)
 *   or its Point of Sale (`posItemCode`).
 * - Dynamic Metadata Generation: Runs a server-side resolver before rendering to dynamically set
 *   indexable page headers (title, meta description) tailored specifically to the product.
 * - Performance Isolation: Left and right layout columns separate static content from highly dynamic,
 *   state-driven elements like `<ImageGallery />`, `<VariantSelector />`, and `<PDPTabs />`.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { serverGetProducts } from '@/graphql/client';
import { ImageGallery } from '@/components/pdp/ImageGallery';
import { VariantSelector } from '@/components/pdp/VariantSelector';
import { PDPTabs } from '@/components/pdp/PDPTabs';

interface PDPPageProps {
  params: Promise<{
    uid: string;
  }>;
}

/**
 * Utility resolver to find a product by either its UID or POS Item Code dynamically (Criterion #11).
 * First attempts to match by UID. If none is returned, queries by POS code as a fallback.
 * 
 * @param routeParam - The dynamic route parameter string representing either the UID or POS Code.
 * @returns An object containing the matched product, API status code, and raw message.
 */
async function resolveProduct(routeParam: string) {
  // 1. Attempt query using routeParam as uid
  let { products, statusCode, message } = await serverGetProducts({
    filter: { uid: routeParam, isActive: true },
    pagination: { skip: 0, limit: 1 },
  });

  let product = products?.[0];

  // 2. If not found by uid, attempt query using routeParam as posItemCode
  if (statusCode === 200 && !product) {
    const fallbackResult = await serverGetProducts({
      filter: { posItemCode: routeParam, isActive: true },
      pagination: { skip: 0, limit: 1 },
    });
    if (fallbackResult.statusCode === 200 && fallbackResult.products?.length > 0) {
      product = fallbackResult.products[0];
      statusCode = fallbackResult.statusCode;
      message = fallbackResult.message;
    }
  }

  return { product, statusCode, message };
}

/**
 * Generate Dynamic SEO Metadata for Walton Plaza PDP.
 * Crawlers leverage this static declaration to fetch localized meta tags.
 */
export async function generateMetadata(props: PDPPageProps): Promise<Metadata> {
  const { uid } = await props.params;

  const { product } = await resolveProduct(uid);

  // Fallback metadata if the product doesn't exist
  if (!product) {
    return {
      title: 'Product Not Found | Walton Plaza',
      description: 'The requested product could not be located in Walton Plaza systems.',
    };
  }

  // Construct highly indexable SEO metadata tags dynamically
  return {
    title: `${product.enName} | Walton Plaza`,
    description: `Purchase ${product.enName} original model on Walton Plaza. Explore top performance specifications, customer warranty, and fast home delivery.`,
  };
}

/**
 * ProductDetailPage - Main Server Component rendering the specific product's page.
 */
export default async function ProductDetailPage(props: PDPPageProps) {
  const { uid } = await props.params;

  // Resolve the product by either UID or POS Item Code dynamically on the server
  const { product, statusCode, message } = await resolveProduct(uid);

  // Handle network/connection failure gracefully by presenting an elegant fallback card
  if (statusCode !== 200) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl bg-rose-50 p-8 dark:bg-rose-950/20">
          <h2 className="text-base font-black text-rose-800 dark:text-rose-400">
            Database Query Failure
          </h2>
          <p className="mt-2 text-xs font-semibold text-rose-600/80 dark:text-rose-400/85">
            Unable to load product specifications. Error: {message} (Status {statusCode})
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-neutral-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-neutral-800"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  // Handle empty product match elegantly
  if (!product) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="text-xl font-black text-neutral-900 dark:text-white">
          Item Not Found
        </h2>
        <p className="mt-2 text-xs font-semibold text-neutral-400 dark:text-neutral-500">
          The product with ID or POS Code &quot;{uid}&quot; does not exist or has been removed from inventory.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation Breadcrumb back to home */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-blue-600 transition-colors dark:text-neutral-500 dark:hover:text-blue-400"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Product Listing</span>
        </Link>
      </div>

      {/* Main product presentation layout */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
        {/* 
          Left Column: Interactive Image Gallery.
          Handles user image toggling, zoom previews, and carousel swipes on mobile.
        */}
        <div>
          <ImageGallery images={product.images} productName={product.enName} />
        </div>

        {/* 
          Right Column: Title, Variant Selectors, and Cart add buttons.
          Deals with highly volatile states like color/storage selectors, price calculations, and stock models.
        */}
        <div className="flex flex-col justify-start">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-500/5 px-2.5 py-1 rounded-full dark:text-blue-400 dark:bg-blue-500/10">
              Walton Premium
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
              {product.enName}
            </h1>
            <p className="mt-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Product ID: {product.uid}
            </p>
          </div>

          {/* Handles interactive variants selection and Zustand cart operations */}
          <div className="mt-8">
            <VariantSelector product={product} />
          </div>
        </div>
      </div>

      {/* 
        Specification Tabs at the Bottom:
        Renders rich text attributes inside detailed tabs (Specs, Deliveries, and Support services).
      */}
      <div className="mt-16 border-t border-neutral-100 pt-10 dark:border-neutral-800">
        <h2 className="text-lg font-black tracking-tight text-neutral-950 dark:text-white mb-6">
          Product Details &amp; Specifications
        </h2>
        <PDPTabs product={product} />
      </div>
    </div>
  );
}

