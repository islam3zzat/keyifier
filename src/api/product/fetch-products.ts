import { createResourceFetcher } from "../create-resource-fetcher";
import { assetsQuery, keylessAssetsPredicate } from "./asset";
import { keylessPricesPredicate, pricesQuery } from "./price";
import { keylessProductsPredicate, productsQuery } from "./product";
import { keylessVariantsPredicate, variantsQuery } from "./variant";

export const fetchProducts = createResourceFetcher({
  query: productsQuery,
  predicate: keylessProductsPredicate,
});

export const fetchVariants = createResourceFetcher({
  query: variantsQuery,
  predicate: keylessVariantsPredicate,
});

export const fetchPrices = createResourceFetcher({
  query: pricesQuery,
  predicate: keylessPricesPredicate,
});

export const fetchAssets = createResourceFetcher({
  query: assetsQuery,
  predicate: keylessAssetsPredicate,
});
