import { Product } from "@commercetools/platform-sdk";
import { waitForNextRequest } from "../../utils/fairness";
import { fetchAssets } from "./fetch-products";
import { setProductAssetsKeys } from "./update-product";

export const fetchAndProcessAssets = async (lastId?: string) => {
  const [error, body] = await fetchAssets(lastId);

  if (error) {
    console.error("Error fetching assets:", error);
    return;
  }

  const products: Product[] = body.results;
  const lastProduct = products[products.length - 1];

  if (!lastProduct) {
    console.log("All product assets have been processed");
    return;
  }

  let processedAssets = 0;
  for (const product of products) {
    const updatedAssets = await setProductAssetsKeys(product);

    processedAssets += updatedAssets;
    console.log(`Processed ${processedAssets} assets`);

    await waitForNextRequest();
  }

  await fetchAndProcessAssets(lastProduct.id);
};
