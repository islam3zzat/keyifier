import { createResourceFetcher } from "../create-resource-fetcher.js";
import {
  CategoryKeyableSubtype,
  keyableTypeToQuery,
} from "./keyable-type/index.js";

export const fetchWithMissingKey = (keyableType: CategoryKeyableSubtype) => {
  const query = keyableTypeToQuery[keyableType];

  return createResourceFetcher(query);
};
