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
