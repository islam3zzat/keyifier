import { Asset, Product, ProductVariant } from "@commercetools/platform-sdk";
import { existWithoutKeyPredicate, keylessPredicate } from "./predicate";
import { splitActions } from "../../utils/split-actions";

export const keylessAssetsPredicate = `
  masterData(
    staged(
      masterVariant(assets(${existWithoutKeyPredicate})) or
      variants(assets(${existWithoutKeyPredicate}))
    )
  )
`;

export const assetsQuery = `query ProductAssetsQuery($predicate: String!) {
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
            assets {
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

export const productToAssetIds = (product: Product) => {
  // @ts-expect-error allVariants is not in the type definition
  const variants: ProductVariant[] = product.masterData.staged.allVariants;

  return variants.reduce((assetIds: string[], variant: ProductVariant) => {
    const ids = (variant.assets || [])
      .filter(
        (asset) => !asset.key // we only want assets without a key
      )
      .map((asset: Asset) => asset.id);

    return assetIds.concat(ids);
  }, []);
};

export const getNextAssetKey = (productId: string, assetId: string) => {
  const prefix = "asset";
  return `${prefix}_${productId}_${assetId}`;
};

export const getAssetActions = (productId: string, assetIds: string[]) => {
  const actions = assetIds.map((assetId) => {
    const key = getNextAssetKey(productId, assetId);

    return {
      setAssetKey: {
        assetId,
        key,
      },
    };
  });

  return splitActions(actions);
};
