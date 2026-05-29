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

// Generate Dynamic SEO Metadata for Walton Plaza PDP
export async function generateMetadata(props: PDPPageProps): Promise<Metadata> {
  const { uid } = await props.params;

  const { products } = await serverGetProducts({
    filter: { uid },
    pagination: { skip: 0, limit: 1 },
  });

  const product = products?.[0];

  if (!product) {
    return {
      title: 'Product Not Found | Walton Plaza',
      description: 'The requested product could not be located in Walton Plaza systems.',
    };
  }

  return {
    title: `${product.enName} | Walton Plaza`,
    description: `Purchase ${product.enName} original model on Walton Plaza. Explore top performance specifications, customer warranty, and fast home delivery.`,
  };
}

export default async function ProductDetailPage(props: PDPPageProps) {
  const { uid } = await props.params;

  // Fetch product specifications on the server
  const { products, statusCode, message } = await serverGetProducts({
    filter: { uid },
    pagination: { skip: 0, limit: 1 },
  });

  const product = products?.[0];

  // Handle network/connection failure gracefully
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

  // Handle empty product match
  if (!product) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="text-xl font-black text-neutral-900 dark:text-white">
          Item Not Found
        </h2>
        <p className="mt-2 text-xs font-semibold text-neutral-400 dark:text-neutral-500">
          The product with ID &quot;{uid}&quot; does not exist or has been removed from inventory.
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
      {/* Navigation Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-blue-600 transition-colors dark:text-neutral-500 dark:hover:text-blue-400"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Product Listing</span>
        </Link>
      </div>

      {/* Main product setup */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div>
          <ImageGallery images={product.images} productName={product.enName} />
        </div>

        {/* Right Column: Title, Variant Selectors, Buy actions */}
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

          <div className="mt-8">
            <VariantSelector product={product} />
          </div>
        </div>
      </div>

      {/* Specification Tabs at the Bottom */}
      <div className="mt-16 border-t border-neutral-100 pt-10 dark:border-neutral-800">
        <h2 className="text-lg font-black tracking-tight text-neutral-950 dark:text-white mb-6">
          Product Details &amp; Specifications
        </h2>
        <PDPTabs product={product} />
      </div>
    </div>
  );
}
