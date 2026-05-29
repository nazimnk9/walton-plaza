import { ProductDiscount, ProductVariant } from '@/graphql/types';

/**
 * Calculates the actual selling price of a variant.
 * If discount.value is present, it directly uses it.
 * Otherwise, it calculates using the formula.
 */
export function calculateSellingPrice(variant: ProductVariant): number {
  const { mrpPrice, discount } = variant;
  if (!discount) return mrpPrice;

  // Use discount.value directly as specified in the API documentation
  if (typeof discount.value === 'number' && discount.value > 0) {
    return discount.value;
  }

  // Fallback calculations if discount.value isn't present
  if (discount.type === 'flat') {
    return Math.max(0, mrpPrice - discount.amount);
  } else if (discount.type === 'percentage') {
    return Math.max(0, mrpPrice - (mrpPrice * discount.amount) / 100);
  }

  return mrpPrice;
}

/**
 * Calculates how much the customer saves for a variant.
 */
export function calculateSavings(variant: ProductVariant): number {
  const { mrpPrice } = variant;
  const sellingPrice = calculateSellingPrice(variant);
  return Math.max(0, mrpPrice - sellingPrice);
}

/**
 * Formats a number to Bangladeshi Taka (BDT) display currency.
 * e.g., 45000 -> ৳45,000
 */
export function formatPrice(price: number): string {
  return `৳${price.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formats discount badge label.
 * e.g. flat discount -> ৳X OFF, percentage -> X% OFF
 */
export function getDiscountBadgeLabel(discount: ProductDiscount | null): string | null {
  if (!discount) return null;
  if (discount.type === 'percentage') {
    return `${discount.amount}% OFF`;
  }
  return `${formatPrice(discount.amount)} OFF`;
}
