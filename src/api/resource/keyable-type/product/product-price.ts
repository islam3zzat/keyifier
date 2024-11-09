import { Price, Product, ProductVariant } from "@commercetools/platform-sdk";
import { existWithoutKeyPredicate } from "../../../resource/predicate.js";
import { splitArray } from "../../../../utils/split-actions.js";

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

export const getNextPriceKey = (productId: string, priceId: string) => {
  const prefix = "price";
  return null;
};

const productToPriceIds = (product: Product) => {
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

const getPriceActions = (productId: string, priceIds: string[]) => {
  const actions = priceIds.map((priceId) => {
    const key = getNextPriceKey(productId, priceId);

    return {
      setPriceKey: {
        priceId,
        key,
      },
    };
  });

  return splitArray(actions);
};

export const priceToActionBatches = (product: Product) => {
  const priceIds = productToPriceIds(product);

  return getPriceActions(product.id, priceIds);
};
