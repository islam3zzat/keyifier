import { Product } from "@commercetools/platform-sdk";
import { waitForNextRequest } from "../../utils/fairness";
import { fetchWithMissingKey } from "./fetch-products";
import { setProductFieldKey } from "./update-product";
import { ProductKeyableType } from "./keyable-type";

export const createProductFetchAnProcess = (type: ProductKeyableType) => {
  const fetcher = fetchWithMissingKey(type);
  const updater = setProductFieldKey(type);

  const fetchAndProcess = async (lastId?: string) => {
    const [error, body] = await fetcher(lastId);

    if (error) {
      console.error(`Error fetching ${type}:`, error);
      return;
    }

    const products: Product[] = body.results;
    const lastProduct = products[products.length - 1];

    if (!lastProduct) {
      console.log(`All ${type} have been processed`);
      return;
    }

    let processed = 0;
    for (const product of products) {
      const updatedResources = await updater(product);

      processed += updatedResources;
      console.log(`Processed ${processed} ${type}`);

      await waitForNextRequest();
    }
  };

  return fetchAndProcess;
};
