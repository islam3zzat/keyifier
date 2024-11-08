import { createResourceFetcher } from "../create-resource-fetcher.js";
import {
  CategoryKeyableSubtype,
  keyableTypeToQuery,
} from "./keyable-type/index.js";

export const fetchWithMissingKey = (keyableType: CategoryKeyableSubtype) => {
  const query = keyableTypeToQuery[keyableType];
  console.log(JSON.stringify(query.query, null, 2));
  return createResourceFetcher(query);
};
