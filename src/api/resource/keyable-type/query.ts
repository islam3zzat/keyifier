import { keylessPredicate } from "../predicate.js";
import {
  KeyableResourceType,
  resourceToQueryFields,
} from "./resource-to-query-fields.js";

const createResourceQuery = (resourceType: KeyableResourceType) => {
  const { queryName, queryField } = resourceToQueryFields(resourceType);

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
  [KeyableResourceType.Category]: {
    query: createResourceQuery(KeyableResourceType.Category),
    predicate: keylessPredicate,
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
