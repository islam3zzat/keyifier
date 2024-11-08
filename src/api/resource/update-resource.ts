import { graphQlRequest } from "../graphql.js";
import { waitForNextRequest } from "../../utils/fairness.js";
import {
  KeyableResourceType,
  resourceToActionBatches,
  resourceMutationMap,
} from "./keyable-type/index.js";

const executeUpdateActions = async (
  type: KeyableResourceType,
  {
    id,
    version,
    actionBatches,
  }: {
    id: string;
    version: number;
    actionBatches: any[][];
  }
) => {
  const { mutation } = resourceMutationMap[type];

  let actionsApplied = 0;
  for (const actions of actionBatches) {
    const variables = { id, version: version + actionsApplied, actions };

    await graphQlRequest({
      query: mutation,
      variables,
    });

    await waitForNextRequest();
  }
};

export const createUpdater = (keyableType: KeyableResourceType) => {
  const updater = async <T extends { id: string; version: number }>(
    resource: T
  ) => {
    const { id, version } = resource;
    const actionBatches = resourceToActionBatches(keyableType, resource);

    await executeUpdateActions(keyableType, { id, version, actionBatches });

    const totalActions = actionBatches.reduce(
      (acc, actions) => acc + actions.length,
      0
    );

    return totalActions;
  };

  return updater;
};
