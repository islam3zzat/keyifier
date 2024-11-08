import {
  KeyableResourceType,
  resourceToQueryFields,
} from "./resource-to-query-fields.js";

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

  return `${prefix}_${id}`;
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

export const resourceToActionBatches = <
  T extends { id: string; version: number }
>(
  resourceType: KeyableResourceType,
  resource: T
) => {
  return getResourceActions(resourceType, resource.id);
};

export const resourceMutationMap = {
  [KeyableResourceType.Product]: {
    mutation: updateResourceMutation(KeyableResourceType.Product),
  },
  [KeyableResourceType.Category]: {
    mutation: updateResourceMutation(KeyableResourceType.Category),
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
