'use client';

import { useState } from 'react';
import { Product } from '@/graphql/types';
import { InfoSection } from './InfoSection';
import { cn } from '@/utils/cn';

interface PDPTabsProps {
  product: Product;
}

type TabKey = 'attributes' | 'descriptions' | 'deliveries' | 'service' | 'priceStocks';

export function PDPTabs({ product }: PDPTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('attributes');

  // Verify and only display tabs that actually have metadata to show.
  const tabs = [
    {
      key: 'attributes' as TabKey,
      label: 'Basic Info',
      items: product.productAttributes,
      fallback: 'No brand, model, or basic characteristics info available.',
    },
    {
      key: 'descriptions' as TabKey,
      label: 'Detailed Info',
      items: product.detailedDescriptions,
      fallback: 'No detailed specifications or descriptions found.',
    },
    {
      key: 'service' as TabKey,
      label: 'Warranty Info',
      items: product.serviceAndDeliveries,
      fallback: 'No warranty guidelines available for this item.',
    },
    {
      key: 'deliveries' as TabKey,
      label: 'Terms & Conditions',
      items: product.deliveries,
      fallback: 'No custom terms or conditions provided.',
    },
    {
      key: 'priceStocks' as TabKey,
      label: 'Special Features',
      items: product.priceAndStocks,
      fallback: 'No highlighted specs or badges listed.',
    },
  ];

  // Active tab detail
  const currentTab = tabs.find((t) => t.key === activeTab)!;

  return (
    <div className="space-y-6">
      {/* Tabs list */}
      <div className="flex border-b border-neutral-100 overflow-x-auto scrollbar-none dark:border-neutral-800">
        <div className="flex gap-1.5 pb-0.5">
          {tabs.map((tab) => {
            const hasData = tab.items && tab.items.length > 0;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative whitespace-nowrap rounded-t-xl px-4 py-3 text-xs font-black transition-all duration-200 border-b-2 -mb-[2px] active:scale-95",
                  activeTab === tab.key
                    ? "border-[#1b4f93] text-[#1b4f93] dark:border-blue-500 dark:text-blue-400"
                    : "border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300",
                  !hasData && "opacity-45 hover:opacity-100" // visually distinguish empty sections
                )}
              >
                {tab.label}
                {!hasData && (
                  <span className="ml-1 text-[9px] font-bold text-neutral-400">(N/A)</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs panels wrapping the single InfoSection component */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <InfoSection
          title={currentTab.label}
          items={currentTab.items}
          fallbackMessage={currentTab.fallback}
        />
      </div>
    </div>
  );
}
