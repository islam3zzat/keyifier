import {
  assetsQuery,
  assetToActionBatches,
  keylessAssetsPredicate,
} from "./asset";
import {
  keylessPricesPredicate,
  pricesQuery,
  priceToActionBatches,
} from "./price";
import { keylessProductsPredicate, productsQuery } from "./product";
import {
  keylessVariantsPredicate,
  variantsQuery,
  variantToActionBatches,
} from "./variant";

export enum ProductKeyableType {
  Product = "product",
  Variant = "variant",
  Price = "price",
  Asset = "asset",
}

export const keyableTypeToQuery = {
  [ProductKeyableType.Product]: {
    query: productsQuery,
    predicate: keylessProductsPredicate,
  },
  [ProductKeyableType.Variant]: {
    query: variantsQuery,
    predicate: keylessVariantsPredicate,
  },
  [ProductKeyableType.Asset]: {
    query: assetsQuery,
    predicate: keylessAssetsPredicate,
  },
  [ProductKeyableType.Price]: {
    query: pricesQuery,
    predicate: keylessPricesPredicate,
  },
};

export const keyableTypeToUpdateOptions = {
  [ProductKeyableType.Product]: {
    getActionBatches: assetToActionBatches,
  },
  [ProductKeyableType.Variant]: {
    getActionBatches: variantToActionBatches,
  },
  [ProductKeyableType.Price]: {
    getActionBatches: priceToActionBatches,
  },
  [ProductKeyableType.Asset]: {
    getActionBatches: assetToActionBatches,
  },
};
