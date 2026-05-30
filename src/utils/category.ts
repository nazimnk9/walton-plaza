/**
 * @file src/utils/category.ts
 * @description Common category classification, rating generation, and SKU description utility helpers.
 * Handles dynamic product classification, deterministic reviews calculations, and human-friendly variant naming.
 */

import { Product, ProductVariant } from '@/graphql/types';

/**
 * Resolves a product's category dynamically based on its attributes and name.
 * Inspects both explicit productAttributes metadata lists and fallback textual name descriptions.
 * 
 * @param product - A single Product object to inspect.
 * @returns Classified category title string (e.g. 'Air Conditioner', 'Blender').
 */
export function getProductCategory(product: Product): string {
  const attrs = product.productAttributes || [];

  // 1. Inspect explicit database metadata label tags first
  if (
    attrs.some(
      (a) =>
        a.enLabel.toLowerCase().includes('air conditioner') ||
        a.enLabel.toLowerCase().includes('cooling capacity')
      )
  ) {
    return 'Air Conditioner';
  }
  if (attrs.some((a) => a.enLabel.toLowerCase().includes('oven') || a.enLabel.toLowerCase().includes('microwave'))) {
    return 'Microwave Oven';
  }
  if (attrs.some((a) => a.enLabel.toLowerCase().includes('blender'))) {
    return 'Blender';
  }
  if (attrs.some((a) => a.enLabel.toLowerCase().includes('refrigerator') || a.enLabel.toLowerCase().includes('freezer'))) {
    return 'Refrigerator';
  }
  if (attrs.some((a) => a.enLabel.toLowerCase().includes('tv') || a.enLabel.toLowerCase().includes('television'))) {
    return 'Television';
  }

  // 2. Fallback: Parse common substrings directly inside the English title
  const name = product.enName.toLowerCase();
  if (name.includes('ac ') || name.includes('air conditioner') || name.includes('inverter ac')) {
    return 'Air Conditioner';
  }
  if (name.includes('oven') || name.includes('microwave')) {
    return 'Microwave Oven';
  }
  if (name.includes('blender') || name.includes('mixer')) {
    return 'Blender';
  }
  if (name.includes('refrigerator') || name.includes('fridge') || name.includes('freezer')) {
    return 'Refrigerator';
  }
  if (name.includes('tv') || name.includes('television') || name.includes('led')) {
    return 'Television';
  }

  return 'Electronics';
}

/**
 * Deterministically resolves a product rating value.
 * Utilizes the backend-supplied rating average if available;
 * otherwise calculates a stable, realistic rating based on the product UID.
 * 
 * Why hash-based? 
 * Ensures the rating remains perfectly consistent for the same item across re-renders,
 * avoiding visual jumpiness in the UI while satisfying a11y.
 * 
 * @param product - A single Product object.
 * @returns Resolved numerical rating score between 4.0 and 5.0.
 */
export function getProductRatingValue(product: Product): number {
  if (product.rating?.average !== null && product.rating?.average !== undefined) {
    return product.rating.average;
  }
  
  // Hash calculation derived from the unique string identifier (UID)
  let hash = 0;
  for (let i = 0; i < product.uid.length; i++) {
    hash = product.uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Yields a stable mock score between 4.0 and 5.0 for clean listing visuals
  return 4.0 + (Math.abs(hash) % 11) / 10;
}

/**
 * Generates an intelligent, human-readable label for a product variant.
 * Prefers capacity (Tonnage/BTU for ACs, Liters for Ovens/Blenders), or colors if present.
 * 
 * @param variant - The ProductVariant configuration target.
 * @param product - The parent Product containing meta descriptions.
 * @param index - The loop index inside collections.
 * @returns Human readable option description (e.g. "1.5 Ton (18,000 BTU)", "25 Liters").
 */
export function getVariantLabel(variant: ProductVariant, product: Product, index: number): string {
  const posCode = variant.posItemCode || '';
  const ebsCode = variant.ebsItemCode || '';
  
  // 1. Detect AC cooling capacity from variant codes
  if (posCode.includes('09') || ebsCode.includes('09')) return '0.75 Ton (9,000 BTU)';
  if (posCode.includes('12') || ebsCode.includes('12')) return '1.0 Ton (12,000 BTU)';
  if (posCode.includes('15') || ebsCode.includes('15')) return '1.25 Ton (15,000 BTU)';
  if (posCode.includes('18') || ebsCode.includes('18')) return '1.5 Ton (18,000 BTU)';
  if (posCode.includes('24') || ebsCode.includes('24')) return '2.0 Ton (24,000 BTU)';

  // 2. Detect liters capacity from variant codes
  if (posCode.includes('30') || ebsCode.includes('30')) return '30 Liters';
  if (posCode.includes('25') || ebsCode.includes('25')) return '25 Liters';
  if (posCode.includes('1.5') || ebsCode.includes('1.5')) return '1.5 Liters';

  // 3. Fallback color check from attributes
  const colorAttr = product.productAttributes?.find(attr => attr.enLabel.toLowerCase() === 'color');
  if (colorAttr && colorAttr.values?.[index]?.enName) {
    return colorAttr.values[index].enName;
  }

  // 4. Default clean SKU label
  if (posCode) return `SKU: ${posCode}`;
  if (ebsCode) return `EBS: ${ebsCode}`;

  return `Option ${index + 1}`;
}

