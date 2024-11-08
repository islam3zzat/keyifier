import { Product } from "@commercetools/platform-sdk";
import { waitForNextRequest } from "../../utils/fairness.js";
import { fetchWithMissingKey } from "./fetch-products.js";
import { setProductFieldKey } from "./update-product.js";
import { ProductKeyableSubtype } from "./keyable-type/index.js";

const createProductFetchAnProcess = (type: ProductKeyableSubtype) => {
  const fetcher = fetchWithMissingKey(type);
  const updater = setProductFieldKey(type);

  const fetchAndProcess = async (lastId?: string) => {
    const [error, body] = await fetcher(lastId);

    if (error) {
      console.error(`Error fetching ${type}:`, error);
      return;
    }

    const products: Product[] = body.products.results;
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

    fetchAndProcess(lastProduct.id);
  };

  return fetchAndProcess;
};

export const fetchAndProcessProductKeys = createProductFetchAnProcess(
  ProductKeyableSubtype.Product
);

export const fetchAndProcessProductVariantKeys = createProductFetchAnProcess(
  ProductKeyableSubtype.Variant
);

export const fetchAndProcessProductPriceKeys = createProductFetchAnProcess(
  ProductKeyableSubtype.Price
);

export const fetchAndProcessProductAssetKeys = createProductFetchAnProcess(
  ProductKeyableSubtype.Asset
);
