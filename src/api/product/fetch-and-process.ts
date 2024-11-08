import { Product } from "@commercetools/platform-sdk";
import { waitForNextRequest } from "../../utils/fairness.js";
import { fetchWithMissingKey } from "./fetch-products.js";
import { setProductFieldKey } from "./update-product.js";
import { ProductKeyableSubtype } from "./keyable-type/index.js";
import { logger, startPeriodicReporting } from "../../lib/log.js";
import { splitArray } from "../../utils/split-actions.js";

const createProductFetchAnProcess = (type: ProductKeyableSubtype) => {
  const fetcher = fetchWithMissingKey(type);
  const updater = setProductFieldKey(type);

  const progress = {
    processed: 0,
  };

  startPeriodicReporting(progress, 5_000);

  const fetchAndProcess = async (lastId?: string) => {
    const [error, body] = await fetcher(lastId);

    if (error) {
      logger.error(`Error fetching ${type}:`, error, { destination: "all" });

      return;
    }

    const products: Product[] = body.products.results;
    const lastProduct = products[products.length - 1];

    if (!lastProduct) {
      logger.info(`All ${type} have been processed`, { destination: "all" });

      return;
    }

    const chunkSize = 20;
    const chunks = splitArray(products, chunkSize);
    for (const chunk of chunks) {
      try {
        const updatedResources = await Promise.all(
          chunk.map((product) => updater(product))
        );
        progress.processed += updatedResources.length;
      } catch (error) {
        console.log(error);
      }

      logger.info(`Processed ${progress.processed} ${type}`, {
        destination: "file",
      });
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
