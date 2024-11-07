import { Product, ProductVariant } from "@commercetools/platform-sdk";
import { existWithoutKeyPredicate, keylessPredicate } from "./predicate";
import { splitActions } from "../../utils/split-actions";

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

export const productToVariantIds = (product: Product) => {
  // @ts-expect-error allVariants is not in the type definition
  const variants: ProductVariant[] = product.masterData.staged.allVariants;

  return variants
    .filter((variant: ProductVariant) => !variant.key)
    .map((variant) => variant.id);
};

export const getNextVariantKey = (productId: string, variantId: number) => {
  const prefix = "variant";
  return `${prefix}_${productId}_${variantId}`;
};

export const getVariantActions = (productId: string, variantIds: number[]) => {
  const actions = variantIds.map((variantId) => {
    const key = getNextVariantKey(productId, variantId);

    return {
      setProductVariantKey: {
        variantId,
        key,
      },
    };
  });

  return splitActions(actions);
};
