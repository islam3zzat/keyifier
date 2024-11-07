import { Product, ProductUpdateAction } from "@commercetools/platform-sdk";
import { graphQlRequest } from "../graphql";
import { version } from "yargs";
import { waitForNextRequest } from "../../utils/fairness";
import { ProductKeyableType, keyableTypeToUpdateOptions } from "./keyable-type";

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
    const res = await graphQlRequest({
      query: updateProductMutation,
      variables,
    });

    console.log(res.body.errors);

    await waitForNextRequest();
  }
};

export const setProductFieldKey = (keyableType: ProductKeyableType) => {
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
