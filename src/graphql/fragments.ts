/**
 * @file src/graphql/fragments.ts
 * @description Standardized, layered GraphQL fragments definitions.
 * Establishes structured, reusable query vectors that prevent API over-fetching.
 * 
 * Strategy:
 * - Layered Fields: Separates variants, pricing schemas, card data grids, and fully detailed specs.
 * - Cascade nesting: Layered queries (`PRODUCT_DETAILS_FIELDS_FRAGMENT` includes `PRODUCT_CARD_FIELDS_FRAGMENT`,
 *   which recursively references `VARIANT_FIELDS_FRAGMENT`). This makes schema definitions clean and easily extensible.
 */

/**
 * Basic pricing metadata parameters for simple items checks.
 */
export const PRICING_FIELDS_FRAGMENT = `
  fragment PricingFields on ProductVariant {
    mrpPrice
    quantity
    discount {
      amount
      value
      type
    }
  }
`;

/**
 * Standardized Variant model parameters containing codes and stocks.
 */
export const VARIANT_FIELDS_FRAGMENT = `
  fragment VariantFields on ProductVariant {
    mrpPrice
    quantity
    discount {
      amount
      value
      type
    }
    ebsItemCode
    posItemCode
  }
`;

/**
 * Minimal Product payload fields required to populate card selectors on listing grids.
 */
export const PRODUCT_CARD_FIELDS_FRAGMENT = `
  fragment ProductCardFields on Product {
    uid
    enName
    images {
      url
    }
    productAttributes {
      enLabel
      values {
        enName
      }
    }
    variants {
      ...VariantFields
    }
    rating {
      average
    }
  }
  ${VARIANT_FIELDS_FRAGMENT}
`;

/**
 * Fully descriptive Product metadata fields containing specs, terms, and deliveries
 * required to load complete Product Details Pages (PDP).
 */
export const PRODUCT_DETAILS_FIELDS_FRAGMENT = `
  fragment ProductDetailsFields on Product {
    ...ProductCardFields
    detailedDescriptions {
      enLabel
      values {
        enName
      }
    }
    deliveries {
      enLabel
      values {
        enName
      }
    }
    serviceAndDeliveries {
      enLabel
      values {
        enName
      }
    }
    priceAndStocks {
      enLabel
      values {
        enName
      }
    }
  }
  ${PRODUCT_CARD_FIELDS_FRAGMENT}
`;

