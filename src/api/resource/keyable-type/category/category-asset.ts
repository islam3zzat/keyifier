import { Category } from "@commercetools/platform-sdk";
import { splitArray } from "../../../../utils/split-actions.js";
import { existWithoutKeyPredicate } from "../../predicate.js";

export const categoryAssetsQuery = `query CategoryAssetsQuery($predicate: String!) {
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
export const keylessAssetsPredicate = `assets(${existWithoutKeyPredicate})`;

export const getNextAssetKey = (categoryId: string, assetId: string) => {
  const prefix = "category_asset";
  return null;
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

  return splitArray(actions);
};

const categoryToVariantIds = (category: Category) => {
  const assets = category.assets || [];

  return assets.map(({ id }) => id);
};

export const assetToActionBatches = (category: Category) => {
  const variantAssets = categoryToVariantIds(category);

  return getAssetActions(category.id, variantAssets);
};
