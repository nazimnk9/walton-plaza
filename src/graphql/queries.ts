import { PRODUCT_DETAILS_FIELDS_FRAGMENT } from './fragments';

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
