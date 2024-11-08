import {
  assetsQuery,
  assetToActionBatches,
  keylessAssetsPredicate,
} from "./asset.js";
import {
  keylessCategoriesPredicate,
  categoriesQuery,
  categoryToActionBatches,
} from "./category.js";

export enum CategoryKeyableSubtype {
  Category = "category",
  Asset = "asset",
}

export const keyableTypeToQuery = {
  [CategoryKeyableSubtype.Category]: {
    query: categoriesQuery,
    predicate: keylessCategoriesPredicate,
  },
  [CategoryKeyableSubtype.Asset]: {
    query: assetsQuery,
    predicate: keylessAssetsPredicate,
  },
};

export const keyableTypeToUpdateOptions = {
  [CategoryKeyableSubtype.Category]: {
    getActionBatches: categoryToActionBatches,
  },
  [CategoryKeyableSubtype.Asset]: {
    getActionBatches: assetToActionBatches,
  },
};
