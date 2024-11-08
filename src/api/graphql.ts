import { GraphQLRequest } from "@commercetools/platform-sdk";
import { apiRoot } from "./client";

export const graphQlRequest = ({ query, variables }: GraphQLRequest) => {
  return apiRoot
    .graphql()
    .post({
      body: {
        query,
        variables,
      },
    })
    .execute();
};
