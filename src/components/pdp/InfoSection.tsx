import { InfoSectionItem } from '@/graphql/types';

interface InfoSectionProps {
  title: string;
  items: InfoSectionItem[] | null | undefined;
  fallbackMessage?: string;
}

// Utility to check if a string contains HTML markup tags
function containsHTML(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

export function InfoSection({ title, items, fallbackMessage = 'No specifications or info available.' }: InfoSectionProps) {
  const hasItems = items && items.length > 0;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
        {title}
      </h3>

      {!hasItems ? (
        <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500">
          {fallbackMessage}
        </p>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {items.map((item, index) => {
            const label = item.enLabel || '';
            const values = item.values || [];
            
            // Check if any of the values contain HTML markup
            const hasHTMLValue = values.some(v => v.enName && containsHTML(v.enName));

            if (!label && values.length === 0) return null;

            return (
              <div
                key={`${label}-${index}`}
                className="grid grid-cols-1 py-3.5 sm:grid-cols-3 sm:gap-4 sm:py-4"
              >
                <dt className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  {label || 'Specification'}
                </dt>
                
                <dd className="mt-1 text-sm font-medium text-neutral-800 dark:text-neutral-200 sm:col-span-2 sm:mt-0 space-y-2">
                  {values.length === 0 ? (
                    'Not Specified'
                  ) : hasHTMLValue ? (
                    // Parse values as HTML safely inside a structured block
                    values.map((v, vIdx) => {
                      const text = v.enName || '';
                      if (containsHTML(text)) {
                        return (
                          <div
                            key={vIdx}
                            dangerouslySetInnerHTML={{ __html: text }}
                            className="prose prose-sm dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-255 text-sm leading-relaxed"
                          />
                        );
                      }
                      return <p key={vIdx}>{text}</p>;
                    })
                  ) : (
                    // Fallback to standard safe text node join
                    <span>{values.map((v) => v.enName).filter(Boolean).join(', ')}</span>
                  )}
                </dd>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
