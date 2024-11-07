import { Product } from "@commercetools/platform-sdk";
import { waitForNextRequest } from "../../utils/fairness";
import { fetchPrices } from "./fetch-products";
import { setProductPricesKeys } from "./update-product";

export const fetchAndProcessPrices = async (lastId?: string) => {
  const [error, body] = await fetchPrices(lastId);

  if (error) {
    console.error("Error fetching prices:", error);
    return;
  }

  const products: Product[] = body.results;
  const lastProduct = products[products.length - 1];

  if (!lastProduct) {
    console.log("All product prices have been processed");
    return;
  }

  let processedPrices = 0;
  for (const product of products) {
    const updatedPrices = await setProductPricesKeys(product);

    processedPrices += updatedPrices;
    console.log(`Processed ${processedPrices} prices`);

    await waitForNextRequest();
  }

  await fetchAndProcessPrices(lastProduct.id);
};
