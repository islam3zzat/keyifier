import { Category, Product } from "@commercetools/platform-sdk";
import { assetToActionBatches } from "./category/category-asset.js";
import { assetToActionBatches as productAssetToActionBatches } from "./product/product-asset.js";
import {
  KeyableResourceType,
  resourceToQueryFields,
} from "./resource-to-query-fields.js";
import { variantToActionBatches } from "./product/product-variant.js";
import { priceToActionBatches } from "./product/product-price.js";

const updateResourceMutation = (resourceType: KeyableResourceType) => {
  const { mutationName, actionTypeName } = resourceToQueryFields(resourceType);

  return `mutation ${mutationName}(
  $id: String
  $version: Long!
  $actions: [${actionTypeName}!]!
) {
  ${mutationName}(id: $id, version: $version, actions: $actions) {
    id
    version
  }
}
`;
};

const getNextResourceKey = (resourceType: KeyableResourceType, id: string) => {
  const prefix = `${resourceType}`;

  return null;
};

const getResourceActions = (resourceType: KeyableResourceType, id: string) => {
  const key = getNextResourceKey(resourceType, id);
  const actions = [
    {
      setKey: {
        key,
      },
    },
  ];

  return [actions];
};

const subfieldToActionBatches = <T extends { id: string; version: number }>(
  resourceType: KeyableResourceType,
  resource: T
) => {
  if (resourceType === KeyableResourceType.CategoryAsset) {
    return assetToActionBatches(resource as unknown as Category);
  }

  if (resourceType === KeyableResourceType.ProductAsset) {
    return productAssetToActionBatches(resource as unknown as Product);
  }

  if (resourceType === KeyableResourceType.ProductVariant) {
    return variantToActionBatches(resource as unknown as Product);
  }
};

export const resourceToActionBatches = <
  T extends { id: string; version: number }
>(
  resourceType: KeyableResourceType,
  resource: T
) => {
  if (resourceType === KeyableResourceType.CategoryAsset) {
    return assetToActionBatches(resource as unknown as Category);
  }

  if (resourceType === KeyableResourceType.ProductAsset) {
    return productAssetToActionBatches(resource as unknown as Product);
  }

  if (resourceType === KeyableResourceType.ProductVariant) {
    return variantToActionBatches(resource as unknown as Product);
  }

  if (resourceType === KeyableResourceType.ProductPrice) {
    return priceToActionBatches(resource as unknown as Product);
  }

  return getResourceActions(resourceType, resource.id);
};

export const resourceMutationMap = {
  [KeyableResourceType.Product]: {
    mutation: updateResourceMutation(KeyableResourceType.Product),
  },
  [KeyableResourceType.ProductAsset]: {
    mutation: updateResourceMutation(KeyableResourceType.ProductAsset),
  },
  [KeyableResourceType.ProductVariant]: {
    mutation: updateResourceMutation(KeyableResourceType.ProductVariant),
  },
  [KeyableResourceType.ProductPrice]: {
    mutation: updateResourceMutation(KeyableResourceType.ProductPrice),
  },
  [KeyableResourceType.Category]: {
    mutation: updateResourceMutation(KeyableResourceType.Category),
  },
  [KeyableResourceType.CategoryAsset]: {
    mutation: updateResourceMutation(KeyableResourceType.CategoryAsset),
  },
  [KeyableResourceType.DiscountCode]: {
    mutation: updateResourceMutation(KeyableResourceType.DiscountCode),
  },
  [KeyableResourceType.CartDiscount]: {
    mutation: updateResourceMutation(KeyableResourceType.CartDiscount),
  },
  [KeyableResourceType.CustomerGroup]: {
    mutation: updateResourceMutation(KeyableResourceType.CustomerGroup),
  },
  [KeyableResourceType.Customer]: {
    mutation: updateResourceMutation(KeyableResourceType.Customer),
  },
  [KeyableResourceType.ProductType]: {
    mutation: updateResourceMutation(KeyableResourceType.ProductType),
  },
  [KeyableResourceType.StandalonePrice]: {
    mutation: updateResourceMutation(KeyableResourceType.StandalonePrice),
  },
  [KeyableResourceType.TaxCategory]: {
    mutation: updateResourceMutation(KeyableResourceType.TaxCategory),
  },
};
