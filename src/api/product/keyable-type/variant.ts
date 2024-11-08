import { Product, ProductVariant } from "@commercetools/platform-sdk";
import { existWithoutKeyPredicate } from "../../resource/predicate.js";
import { splitArray } from "../../../utils/split-actions.js";

export const keylessVariantsPredicate = `
  masterData(
    staged (
      masterVariant(${existWithoutKeyPredicate}) or
      variants(${existWithoutKeyPredicate})
    )
  )
`;

export const variantsQuery = `query ProductVariantsQuery($predicate: String!) {
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
          }
        }
      }
    }
  }
}
`;

export const getNextVariantKey = (productId: string, variantId: number) => {
  const prefix = "variant";
  return `${prefix}_${productId}_${variantId}`;
};

const productToVariantIds = (product: Product) => {
  // @ts-expect-error allVariants is not in the type definition
  const variants: ProductVariant[] = product.masterData.staged.allVariants;

  return variants
    .filter((variant: ProductVariant) => !variant.key)
    .map((variant) => variant.id);
};

const getVariantActions = (productId: string, variantIds: number[]) => {
  const actions = variantIds.map((variantId) => {
    const key = getNextVariantKey(productId, variantId);

    return {
      setProductVariantKey: {
        variantId,
        key,
      },
    };
  });

  return splitArray(actions);
};

export const variantToActionBatches = (product: Product) => {
  const variantIds = productToVariantIds(product);
  return getVariantActions(product.id, variantIds);
};
