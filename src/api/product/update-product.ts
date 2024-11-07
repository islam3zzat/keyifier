import { Product, ProductUpdateAction } from "@commercetools/platform-sdk";
import { graphQlRequest } from "../graphql";
import { version } from "yargs";
import { waitForNextRequest } from "../../utils/fairness";
import { getProductActions } from "./product";
import { getVariantActions, productToVariantIds } from "./variant";
import { getPriceActions, productToPriceIds } from "./price";
import { getAssetActions, productToAssetIds } from "./asset";

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

export const setProductKey = (product: Product) => {
  const { id, version } = product;
  const actionBatches = getProductActions(id);

  return executeUpdateActions({ id, version, actionBatches });
};

export const setProductVariantsKeys = async (product: Product) => {
  const { id, version } = product;
  const variantIds = productToVariantIds(product);

  const actionBatches = getVariantActions(id, variantIds);

  await executeUpdateActions({ id, version, actionBatches });

  return variantIds.length;
};

export const setProductPricesKeys = async (product: Product) => {
  const { id, version } = product;
  const priceIds = productToPriceIds(product);

  const actionBatches = getPriceActions(id, priceIds);

  await executeUpdateActions({ id, version, actionBatches });

  return priceIds.length;
};

export const setProductAssetsKeys = async (product: Product) => {
  const { id, version } = product;
  const assetIds = productToAssetIds(product);

  const actionBatches = getAssetActions(id, assetIds);

  await executeUpdateActions({ id, version, actionBatches });

  return assetIds.length;
};
