import { Category } from "@commercetools/platform-sdk";
import { graphQlRequest } from "../graphql.js";
import { waitForNextRequest } from "../../utils/fairness.js";
import {
  CategoryKeyableSubtype,
  keyableTypeToUpdateOptions,
} from "./keyable-type/index.js";

const updateCategoryMutation = `mutation UpdateCategory(
  $id: String
  $version: Long!
  $actions: [CategoryUpdateAction!]!
) {
  updateCategory(id: $id, version: $version, actions: $actions) {
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
      query: updateCategoryMutation,
      variables,
    });

    await waitForNextRequest();
  }
};

export const setCategoryFieldKey = (keyableType: CategoryKeyableSubtype) => {
  const { getActionBatches } = keyableTypeToUpdateOptions[keyableType];

  const setKey = async (category: Category) => {
    const { id, version } = category;

    const actionBatches = getActionBatches(category);

    await executeUpdateActions({ id, version, actionBatches });

    const totalActions = actionBatches.reduce(
      (acc, actions) => acc + actions.length,
      0
    );

    return totalActions;
  };

  return setKey;
};
