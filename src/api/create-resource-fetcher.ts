import { graphQlRequest } from "./graphql";

export const createResourceFetcher = ({
  query,
  predicate,
}: {
  query: string;
  predicate: string;
}) => {
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
      console.error(errors);
      return [errors, null];
    }

    return [null, data.products];
  };

  return fetchResource;
};
