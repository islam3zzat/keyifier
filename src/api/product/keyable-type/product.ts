import { Product } from "@commercetools/platform-sdk";
import { keylessPredicate } from "../predicate";

export const keylessProductsPredicate = keylessPredicate;

export const productsQuery = `query ProductsQuery($predicate: String!) {
    products(where: $predicate, sort: "id asc", limit: 500) {
      total
      results {
        id
        version
      }
    }
  }
`;

export const getNextProductKey = (id: string) => {
  const prefix = "product_v1002";
  return `${prefix}_${id}`;
};

const getProductActions = (id: string) => {
  const key = getNextProductKey(id);
  const actions = [
    {
      setKey: {
        key,
      },
    },
  ];

  return [actions];
};

export const productToActionBatches = (product: Product) => {
  return getProductActions(product.id);
};
