import { Category } from "@commercetools/platform-sdk";
import { existWithoutKeyPredicate } from "../../resource/predicate.js";
import { splitActions } from "../../../utils/split-actions.js";

export const keylessAssetsPredicate = `assets(${existWithoutKeyPredicate})`;

export const assetsQuery = `query CategoryAssetsQuery($predicate: String!) {
  categories(where: $predicate, sort: "id asc", limit: 500) {
    total
    results {
      id
      version
      assets {
        id
        key
      }
    }
  }
}
`;

export const getNextAssetKey = (categoryId: string, assetId: string) => {
  const prefix = "category_asset";
  return `${prefix}_${categoryId}_${assetId}`;
};

const categoryToVariantIds = (category: Category) => {
  const assets = category.assets || [];

  return assets.map(({ id }) => id);
};

const getAssetActions = (categoryId: string, assetIds: string[]) => {
  const actions = assetIds.map((assetId) => {
    const assetKey = getNextAssetKey(categoryId, assetId);

    return {
      setAssetKey: {
        assetId,
        assetKey,
      },
    };
  });

  return splitActions(actions);
};

export const assetToActionBatches = (category: Category) => {
  const variantAssets = categoryToVariantIds(category);

  return getAssetActions(category.id, variantAssets);
};
