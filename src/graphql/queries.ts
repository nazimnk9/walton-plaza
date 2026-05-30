/**
 * @file src/graphql/queries.ts
 * @description GraphQL Query templates defining Walton Plaza APIs endpoints connections.
 * 
 * Features:
 * - Parametrized Variable Mappings: Safely passes pagination configurations
 *   (skip/limit indices) and filters parameters to prevent API injection errors.
 * - Layered Field expansion: Inject fully mapped specification schemas automatically.
 */

import { PRODUCT_DETAILS_FIELDS_FRAGMENT } from './fragments';

/**
 * GET_PRODUCTS_QUERY - Core catalog fetcher string.
 * Orchestrates targeted product query sweeps against the backend GraphQL databases.
 */
export const GET_PRODUCTS_QUERY = `
  query GetProducts($pagination: PaginationInput, $filter: ProductFilterInput) {
    getProducts(pagination: $pagination, filter: $filter) {
      message
      statusCode
      result {
        count
        products {
          ...ProductDetailsFields
        }
      }
    }
  }
  ${PRODUCT_DETAILS_FIELDS_FRAGMENT}
`;

