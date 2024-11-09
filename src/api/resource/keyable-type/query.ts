import { keylessPredicate } from "../predicate.js";
import {
  categoryAssetsQuery,
  keylessAssetsPredicate,
} from "./category/category-asset.js";
import {
  keylessProductAssetsPredicate,
  productAssetsQuery,
} from "./product/product-asset.js";
import {
  keylessPricesPredicate,
  pricesQuery,
} from "./product/product-price.js";
import {
  keylessVariantsPredicate,
  variantsQuery,
} from "./product/product-variant.js";

import {
  KeyableResourceType,
  resourceToQueryFields,
} from "./resource-to-query-fields.js";

const subFieldQuery = (resourceType: KeyableResourceType) => {
  if (resourceType === KeyableResourceType.CategoryAsset) {
    return categoryAssetsQuery;
  }

  if (resourceType === KeyableResourceType.ProductAsset) {
    return productAssetsQuery;
  }

  if (resourceType === KeyableResourceType.ProductVariant) {
    return variantsQuery;
  }

  if (resourceType === KeyableResourceType.ProductPrice) {
    return pricesQuery;
  }
};

const createResourceQuery = (resourceType: KeyableResourceType) => {
  const { queryName, queryField } = resourceToQueryFields(resourceType);

  const fieldQuery = subFieldQuery(resourceType);

  if (fieldQuery) {
    return fieldQuery;
  }

  return `query ${queryName}($predicate: String!) {
    ${queryField}(where: $predicate, sort: "id asc", limit: 500) {
      total
      results {
        id
        version
      }
    }
  }
`;
};

export const resourceQueryPredicateMap = {
  [KeyableResourceType.Product]: {
    query: createResourceQuery(KeyableResourceType.Product),
    predicate: keylessPredicate,
  },
  [KeyableResourceType.ProductAsset]: {
    query: createResourceQuery(KeyableResourceType.ProductAsset),
    predicate: keylessProductAssetsPredicate,
  },
  [KeyableResourceType.ProductVariant]: {
    query: createResourceQuery(KeyableResourceType.ProductVariant),
    predicate: keylessVariantsPredicate,
  },
  [KeyableResourceType.ProductPrice]: {
    query: createResourceQuery(KeyableResourceType.ProductPrice),
    predicate: keylessPricesPredicate,
  },
  [KeyableResourceType.Category]: {
    query: createResourceQuery(KeyableResourceType.Category),
    predicate: keylessPredicate,
  },
  [KeyableResourceType.CategoryAsset]: {
    query: createResourceQuery(KeyableResourceType.CategoryAsset),
    predicate: keylessAssetsPredicate,
  },
  [KeyableResourceType.DiscountCode]: {
    query: createResourceQuery(KeyableResourceType.DiscountCode),
    predicate: keylessPredicate,
  },
  [KeyableResourceType.CartDiscount]: {
    query: createResourceQuery(KeyableResourceType.CartDiscount),
    predicate: keylessPredicate,
  },
  [KeyableResourceType.CustomerGroup]: {
    query: createResourceQuery(KeyableResourceType.CustomerGroup),
    predicate: keylessPredicate,
  },
  [KeyableResourceType.Customer]: {
    query: createResourceQuery(KeyableResourceType.Customer),
    predicate: keylessPredicate,
  },
  [KeyableResourceType.ProductType]: {
    query: createResourceQuery(KeyableResourceType.ProductType),
    predicate: keylessPredicate,
  },
  [KeyableResourceType.StandalonePrice]: {
    query: createResourceQuery(KeyableResourceType.StandalonePrice),
    predicate: keylessPredicate,
  },
  [KeyableResourceType.TaxCategory]: {
    query: createResourceQuery(KeyableResourceType.TaxCategory),
    predicate: keylessPredicate,
  },
};
