/**
 * @file src/graphql/types.ts
 * @description TypeScript interface typings mapping GraphQL entity schemas.
 * Standardizes definitions for images, discounts, variants, specifications table models, and API boundaries.
 */

/**
 * Image resource link structure.
 */
export interface GraphQLImage {
  url: string; // The fully resolved HTTP asset location URL
}

/**
 * Singular attribute value inside specifications panels.
 */
export interface InfoSectionValue {
  enName: string; // The resolved English string representation
}

/**
 * Reusable key-value row representation inside specifications collections.
 */
export interface InfoSectionItem {
  enLabel: string; // Specification label name (e.g. "Brand", "Storage Capacity")
  values: InfoSectionValue[]; // Value array mapping standard parameters
}

/**
 * Dynamic price reduction schema structures.
 */
export interface ProductDiscount {
  amount: number; // Raw nominal discount values (e.g., 1000 Taka, or 10 percent)
  value: number; // Calculated dynamic payable selling price after discount calculations
  type: 'flat' | 'percentage'; // The active reduction calculation algorithm bounds
}

/**
 * Reusable Variant item structure.
 */
export interface ProductVariant {
  mrpPrice: number; // Manufacturers Suggested Retail Price
  ebsItemCode: string; // Dynamic Enterprise Business Suite code
  posItemCode: string; // Dynamic Point of Sale code
  quantity: number; // Live stock units currently available in plaza inventories
  discount: ProductDiscount | null; // Optional reduction schema details
}

/**
 * Customer reviews rating details.
 */
export interface ProductRating {
  average: number | null; // Aggregated score out of 5 stars
}

/**
 * Foundational Product representation model.
 * Maps specifications tables, image assets, variants configurations, and rating details.
 */
export interface Product {
  uid: string; // Database database primary identifier
  enName: string; // Product descriptive English name title
  images: GraphQLImage[]; // Image array resources
  productAttributes: InfoSectionItem[] | null; // Common characteristics specs
  detailedDescriptions: InfoSectionItem[] | null; // Extended specification tables
  deliveries: InfoSectionItem[] | null; // plaza terms descriptions
  serviceAndDeliveries: InfoSectionItem[] | null; // Support structures
  priceAndStocks: InfoSectionItem[] | null; // Promotional spec tables
  variants: ProductVariant[]; // Option list (color, storage capacity, etc.)
  rating: ProductRating | null; // Customer rating average
}

/**
 * Direct search result schema.
 */
export interface GetProductsResult {
  count: number; // Total database record match quantities matching parameters
  products: Product[]; // Product array slice matching current boundaries
}

/**
 * Nested GraphQL API response schemas.
 */
export interface GetProductsData {
  message: string;
  statusCode: number;
  result: GetProductsResult;
}

export interface GetProductsResponse {
  getProducts: GetProductsData;
}

/**
 * Query variables interface for filtering and paging.
 */
export interface GetProductsVariables {
  pagination?: {
    skip?: number; // Starting page offset
    limit?: number; // Maximum records query caps
  };
  filter?: {
    uid?: string | null;
    posItemCode?: string | null;
    isActive?: boolean | null;
  };
}

