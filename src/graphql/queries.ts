export const GET_PRODUCTS_QUERY = `
  query GetProducts($pagination: PaginationInput, $filter: ProductFilterInput) {
    getProducts(pagination: $pagination, filter: $filter) {
      message
      statusCode
      result {
        count
        products {
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
          variants {
            mrpPrice
            ebsItemCode
            posItemCode
            quantity
            discount {
              amount
              value
              type
            }
          }
        }
      }
    }
  }
`;
