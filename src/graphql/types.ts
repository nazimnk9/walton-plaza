export interface GraphQLImage {
  url: string;
}

export interface InfoSectionValue {
  enName: string;
}

export interface InfoSectionItem {
  enLabel: string;
  values: InfoSectionValue[];
}

export interface ProductDiscount {
  amount: number;
  value: number; // Final selling price after discount
  type: 'flat' | 'percentage';
}

export interface ProductVariant {
  mrpPrice: number;
  ebsItemCode: string;
  posItemCode: string;
  quantity: number; // Stock available
  discount: ProductDiscount | null;
}

export interface ProductRating {
  average: number | null;
}

export interface Product {
  uid: string;
  enName: string; // Product title
  images: GraphQLImage[];
  productAttributes: InfoSectionItem[] | null;
  detailedDescriptions: InfoSectionItem[] | null;
  deliveries: InfoSectionItem[] | null;
  serviceAndDeliveries: InfoSectionItem[] | null;
  priceAndStocks: InfoSectionItem[] | null;
  variants: ProductVariant[];
  rating: ProductRating | null;
}

export interface GetProductsResult {
  count: number;
  products: Product[];
}

export interface GetProductsData {
  message: string;
  statusCode: number;
  result: GetProductsResult;
}

export interface GetProductsResponse {
  getProducts: GetProductsData;
}

export interface GetProductsVariables {
  pagination?: {
    skip?: number;
    limit?: number;
  };
  filter?: {
    uid?: string | null;
    posItemCode?: string | null;
    isActive?: boolean | null;
  };
}
