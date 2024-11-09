import { consoleLogger } from "../../lib/log.js";
import { graphQlRequest } from "../graphql.js";

type FetcherParams = { query: string; predicate: string };
export const createResourceFetcher = ({ query, predicate }: FetcherParams) => {
  const fetchResource = async (lastId?: string) => {
    const idPredicate = lastId ? `id > "${lastId}"` : "";

    const queryPredicate = [predicate, idPredicate]
      .filter(Boolean)
      .join(" and ");

    const {
      body: { data, errors },
    } = await graphQlRequest({
      query,
      variables: { predicate: queryPredicate },
    });

    if (errors && errors.length > 0) {
      errors.forEach((error) => {
        consoleLogger.error(error.message);
      });

      return [errors, null];
    }

    return [null, data];
  };

  return fetchResource;
};
