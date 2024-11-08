import {
  assetsQuery,
  assetToActionBatches,
  keylessAssetsPredicate,
} from "./asset.js";
import {
  keylessPricesPredicate,
  pricesQuery,
  priceToActionBatches,
} from "./price.js";
import {
  keylessProductsPredicate,
  productsQuery,
  productToActionBatches,
} from "./product.js";
import {
  keylessVariantsPredicate,
  variantsQuery,
  variantToActionBatches,
} from "./variant.js";

export enum ProductKeyableSubtype {
  Product = "product",
  Variant = "variant",
  Price = "price",
  Asset = "asset",
}

export const keyableTypeToQuery = {
  [ProductKeyableSubtype.Product]: {
    query: productsQuery,
    predicate: keylessProductsPredicate,
  },
  [ProductKeyableSubtype.Variant]: {
    query: variantsQuery,
    predicate: keylessVariantsPredicate,
  },
  [ProductKeyableSubtype.Asset]: {
    query: assetsQuery,
    predicate: keylessAssetsPredicate,
  },
  [ProductKeyableSubtype.Price]: {
    query: pricesQuery,
    predicate: keylessPricesPredicate,
  },
};

export const keyableTypeToUpdateOptions = {
  [ProductKeyableSubtype.Product]: {
    getActionBatches: productToActionBatches,
  },
  [ProductKeyableSubtype.Variant]: {
    getActionBatches: variantToActionBatches,
  },
  [ProductKeyableSubtype.Price]: {
    getActionBatches: priceToActionBatches,
  },
  [ProductKeyableSubtype.Asset]: {
    getActionBatches: assetToActionBatches,
  },
};
