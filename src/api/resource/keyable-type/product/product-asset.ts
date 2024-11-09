import { Asset, Product, ProductVariant } from "@commercetools/platform-sdk";
import { splitArray } from "../../../../utils/split-actions.js";
import { existWithoutKeyPredicate } from "../../predicate.js";

export const keylessProductAssetsPredicate = `
  masterData(
    staged(
      masterVariant(assets(${existWithoutKeyPredicate})) or
      variants(assets(${existWithoutKeyPredicate}))
    )
  )
`;

export const productAssetsQuery = `query ProductAssetsQuery($predicate: String!) {
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

export const keylessAssetsPredicate = `
  masterData(
    staged(
      masterVariant(assets(${existWithoutKeyPredicate})) or
      variants(assets(${existWithoutKeyPredicate}))
    )
  )
`;

const getNextAssetKey = (productId: string, assetId: string) => {
  const prefix = "asset";
  return `${prefix}_${productId}_${assetId}`;
};
type VariantAsset = {
  variantId: number;
  assetId: string;
};

const productToVariantAssets = (product: Product) => {
  // @ts-expect-error allVariants is not in the type definition
  const variants: ProductVariant[] = product.masterData.staged.allVariants;

  return variants.reduce(
    (acc: Array<VariantAsset>, variant: ProductVariant) => {
      const variantAssets = (variant.assets || [])
        .filter(
          (asset) => !asset.key // we only want assets without a key
        )
        .map((asset: Asset) => ({
          variantId: variant.id,
          assetId: asset.id,
        }));

      return acc.concat(variantAssets);
    },
    []
  );
};

const getAssetActions = (productId: string, variantAssets: VariantAsset[]) => {
  const actions = variantAssets.map(({ assetId, variantId }) => {
    const key = getNextAssetKey(productId, assetId);

    return {
      setAssetKey: {
        assetId,
        variantId,
        key,
      },
    };
  });

  return splitArray(actions);
};

export const assetToActionBatches = (product: Product) => {
  const variantAssets = productToVariantAssets(product);

  return getAssetActions(product.id, variantAssets);
};
