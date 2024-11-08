import { waitForNextRequest } from "../../utils/fairness.js";
import { fetchWithMissingKey } from "./fetch-resources.js";
import { createUpdater } from "./update-resource.js";
import {
  KeyableResourceType,
  resourceToQueryFields,
} from "./keyable-type/index.js";
import { logger, startPeriodicReporting } from "../../lib/log.js";

type Resource = {
  id: string;
  version: number;
};

const createResourceFetchAnProcess = (type: KeyableResourceType) => {
  const fetcher = fetchWithMissingKey(type);
  const updater = createUpdater(type);
  const { queryField } = resourceToQueryFields(type);

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

    const resources: Resource[] = body[queryField].results;
    const lastResource = resources[resources.length - 1];

    if (!lastResource) {
      logger.info(`All ${type} have been processed`, { destination: "all" });

      return;
    }

    for (const resource of resources) {
      const updatedResources = await updater(resource);

      progress.processed += updatedResources;
      logger.info(`Processed ${progress.processed} ${type}`, {
        destination: "file",
      });
    }

    fetchAndProcess(lastResource.id);
  };

  return fetchAndProcess;
};

export const fetchAndProcessDiscountCodeKeys = createResourceFetchAnProcess(
  KeyableResourceType.DiscountCode
);

export const fetchAndProcessCartDiscountKeys = createResourceFetchAnProcess(
  KeyableResourceType.CartDiscount
);

export const fetchAndProcessCustomerGroupKeys = createResourceFetchAnProcess(
  KeyableResourceType.CustomerGroup
);

export const fetchAndProcessCustomerKeys = createResourceFetchAnProcess(
  KeyableResourceType.Customer
);

export const fetchAndProcessProductTypeKeys = createResourceFetchAnProcess(
  KeyableResourceType.ProductType
);

export const fetchAndProcessStandalonePriceKeys = createResourceFetchAnProcess(
  KeyableResourceType.StandalonePrice
);

export const fetchAndProcessTaxCategoryKeys = createResourceFetchAnProcess(
  KeyableResourceType.TaxCategory
);
