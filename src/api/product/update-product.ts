import { Product } from "@commercetools/platform-sdk";
import { graphQlRequest } from "../graphql.js";
import { waitForNextRequest } from "../../utils/fairness.js";
import {
  ProductKeyableSubtype,
  keyableTypeToUpdateOptions,
} from "./keyable-type/index.js";

const updateProductMutation = `mutation UpdateProduct(
  $id: String
  $version: Long!
  $actions: [ProductUpdateAction!]!
) {
  updateProduct(id: $id, version: $version, actions: $actions) {
    id
    version
  }
}
`;

const executeUpdateActions = async ({
  id,
  version,
  actionBatches,
}: {
  id: string;
  version: number;
  actionBatches: any[][];
}) => {
  let actionsApplied = 0;
  for (const actions of actionBatches) {
    const variables = { id, version: version + actionsApplied, actions };
    await graphQlRequest({
      query: updateProductMutation,
      variables,
    });

    await waitForNextRequest();
  }
};

export const setProductFieldKey = (keyableType: ProductKeyableSubtype) => {
  const { getActionBatches } = keyableTypeToUpdateOptions[keyableType];

  const setKey = async (product: Product) => {
    const { id, version } = product;

    const actionBatches = getActionBatches(product);

    await executeUpdateActions({ id, version, actionBatches });

    const totalActions = actionBatches.reduce(
      (acc, actions) => acc + actions.length,
      0
    );

    return totalActions;
  };

  return setKey;
};
