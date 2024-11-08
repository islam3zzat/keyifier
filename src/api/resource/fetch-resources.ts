import { createResourceFetcher } from "../create-resource-fetcher.js";
import {
  KeyableResourceType,
  resourceQueryPredicateMap,
} from "./keyable-type/index.js";

export const fetchWithMissingKey = (keyableType: KeyableResourceType) => {
  const query = resourceQueryPredicateMap[keyableType];

  return createResourceFetcher(query);
};
