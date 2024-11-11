import { createUpdater } from "./update-resource.js";
import {
  KeyableResourceType,
  resourceQueryPredicateMap,
  resourceToQueryFields,
} from "./keyable-type/index.js";
import { consoleLogger, fileLogger } from "../../lib/log.js";
import { splitArray } from "../../utils/split-actions.js";
import { createResourceFetcher } from "./create-resource-fetcher.js";
import { UPDATE_BATCH_SIZE } from "../../utils/fairness.js";

type Resource = {
  id: string;
  version: number;
};

type FetchAndProcessOptions = {
  batchSize?: number;
  logInterval?: number;
  concurrencyLimit?: number;
};

const DEFAULT_OPTIONS: FetchAndProcessOptions = {
  batchSize: UPDATE_BATCH_SIZE,
  logInterval: 5_000,
};
type FetchTotalFunction = () => Promise<number | undefined>;
type FetchProcessFunction = () => Promise<void>;

const createResourceFetchAndProcess = (
  type: KeyableResourceType,
  options: FetchAndProcessOptions = {}
): FetchProcessFunction => {
  const { batchSize, logInterval } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const fetcher = createResourceFetcher(resourceQueryPredicateMap[type]);
  const updater = createUpdater(type);
  const { queryField } = resourceToQueryFields(type);

  const progress = { processed: 0 };

  let intervalId: NodeJS.Timeout | undefined;

  const logProgress = () => {
    intervalId = setInterval(() => {
      consoleLogger.info(
        `Processed ${progress.processed.toLocaleString()} ${type}`
      );
    }, logInterval);
  };

  const stopProgressLog = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const fetchAndProcess = async (lastId?: string) => {
    if (!intervalId) logProgress();

    try {
      const [error, body] = await fetcher(lastId);

      if (error) {
        consoleLogger.error(`Error fetching ${type}:`, error);
        stopProgressLog();

        return;
      }

      const resources: Resource[] = body[queryField].results;
      const lastResource = resources[resources.length - 1];

      if (!lastResource) {
        consoleLogger.info(`All ${type} have been processed`);
        stopProgressLog();

        return;
      }

      const resourceBatches = splitArray(resources, batchSize);

      for (const resourceBatche of resourceBatches) {
        const appliedResources = await Promise.all(resourceBatche.map(updater));

        const updatedResources = appliedResources.reduce(
          (acc, updatedResources) => acc + updatedResources,
          0
        );

        progress.processed += updatedResources;
        fileLogger.info(
          "resources updated: " + resourceBatche.map(({ id }) => id).join(", ")
        );
        fileLogger.info(`Processed ${progress.processed} ${type}`);
      }

      await fetchAndProcess(lastResource.id);
    } catch (error: any) {
      consoleLogger.error(error.message);
      stopProgressLog();

      throw error;
    }
  };

  return fetchAndProcess;
};

export const createTotalFetcher = (
  type: KeyableResourceType
): FetchTotalFunction => {
  const { queryField } = resourceToQueryFields(type);
  const fetcher = createResourceFetcher(resourceQueryPredicateMap[type], 0);

  return async () => {
    const [error, body] = await fetcher();
    if (error) {
      consoleLogger.error(`Error fetching ${type}:`, error);

      return;
    }

    const total = body[queryField].total;

    return total;
  };
};

type FetchProcess = {
  type: KeyableResourceType;
  fetchTotal: FetchTotalFunction;
  fetchProcess: FetchProcessFunction;
};

const createFetchersMap = (types: KeyableResourceType[]): FetchProcess[] =>
  types.map((type) => ({
    type,
    fetchTotal: createTotalFetcher(type),
    fetchProcess: createResourceFetchAndProcess(type),
  }));

const productTypes = [
  KeyableResourceType.Product,
  KeyableResourceType.ProductAsset,
  KeyableResourceType.ProductVariant,
  KeyableResourceType.ProductPrice,
];
export const productFetchers = createFetchersMap(productTypes);

const categoryTypes = [
  KeyableResourceType.Category,
  KeyableResourceType.CategoryAsset,
];
export const categoryFetchers = createFetchersMap(categoryTypes);

const otherTypes = Object.values(KeyableResourceType).filter(
  (type) => !productTypes.includes(type) && !categoryTypes.includes(type)
);
export const otherFetchers = createFetchersMap(otherTypes);
