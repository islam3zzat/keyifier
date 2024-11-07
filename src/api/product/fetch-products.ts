import { createResourceFetcher } from "../create-resource-fetcher";
import { ProductKeyableType, keyableTypeToQuery } from "./keyable-type";

export const fetchWithMissingKey = (keyableType: ProductKeyableType) => {
  const query = keyableTypeToQuery[keyableType];
  return createResourceFetcher(query);
};
