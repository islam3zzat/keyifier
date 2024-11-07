import { Price, Product, ProductVariant } from "@commercetools/platform-sdk";
import { existWithoutKeyPredicate, keylessPredicate } from "./predicate";
import { splitActions } from "../../utils/split-actions";

export const keylessPricesPredicate = `
  masterData(
    staged(
      masterVariant(prices(${existWithoutKeyPredicate})) or
      variants(prices(${existWithoutKeyPredicate}))
    )
  )
`;

export const pricesQuery = `query ProductPricesQuery($predicate: String!) {
  products(where: $predicate, sort: "id asc", limit: 500) {
    total
    results {
      id
      version
      masterData {
        staged {
          allVariants {
            id
            key
            prices {
              id
              key
            }
          }
        }
      }
    }
  }
}
`;

export const productToPriceIds = (product: Product) => {
  // @ts-expect-error allVariants is not in the type definition
  const variants: ProductVariant[] = product.masterData.staged.allVariants;

  return variants.reduce((priceIds: string[], variant: ProductVariant) => {
    const ids = (variant.prices || [])
      .filter(
        (price) => !price.key // we only want prices without a key
      )
      .map((price: Price) => price.id);

    return priceIds.concat(ids);
  }, []);
};

export const getNextPriceKey = (productId: string, priceId: string) => {
  const prefix = "price";
  return `${prefix}_${productId}_${priceId}`;
};

export const getPriceActions = (productId: string, priceIds: string[]) => {
  const actions = priceIds.map((priceId) => {
    const key = getNextPriceKey(productId, priceId);

    return {
      setPriceKey: {
        priceId,
        key,
      },
    };
  });

  return splitActions(actions);
};
