import { consoleLogger } from "../../lib/log.js";
import { graphQlRequest } from "../graphql.js";

type FetcherArgs = { query: string; predicate: string };
export const createResourceFetcher = (args: FetcherArgs) => {
  const fetchResource = async (lastId?: string) => {
    const predicate = predicateWithId(args.predicate, lastId);
    const variables = { predicate };

    const { body } = await graphQlRequest({ query: args.query, variables });
    const { data, errors } = body;

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

const predicateWithId = (predicate: string, lastId?: string) => {
  const idPredicate = lastId ? `id > "${lastId}"` : "";

  return [predicate, idPredicate].filter(Boolean).join(" and ");
};
