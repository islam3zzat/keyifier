import { Category } from "@commercetools/platform-sdk";
import { waitForNextRequest } from "../../utils/fairness.js";
import { fetchWithMissingKey } from "./fetch-categories.js";
import { setCategoryFieldKey } from "./update-category.js";
import { CategoryKeyableSubtype } from "./keyable-type/index.js";
import { logger, startPeriodicReporting } from "../../lib/log.js";

const createCategoryFetchAnProcess = (type: CategoryKeyableSubtype) => {
  const fetcher = fetchWithMissingKey(type);
  const updater = setCategoryFieldKey(type);

  const progress = {
    processed: 0,
  };

  const intervalId = startPeriodicReporting(progress, 5_000);

  const fetchAndProcess = async (lastId?: string) => {
    const [error, body] = await fetcher(lastId);

    if (error) {
      logger.error(`Error fetching ${type}:`, error, { destination: "all" });
      clearInterval(intervalId);

      return;
    }

    const categories: Category[] = body.categories.results;
    const lastCategory = categories[categories.length - 1];

    if (!lastCategory) {
      logger.info(`All ${type} have been processed`, { destination: "all" });
      clearInterval(intervalId);

      return;
    }

    for (const category of categories) {
      const updatedResources = await updater(category);

      progress.processed += updatedResources;
      logger.info(`Processed ${progress.processed} ${type}`, {
        destination: "file",
      });

      await waitForNextRequest();
    }

    fetchAndProcess(lastCategory.id);
  };

  return fetchAndProcess;
};

export const fetchAndProcessCategoryKeys = createCategoryFetchAnProcess(
  CategoryKeyableSubtype.Category
);

export const fetchAndProcessCategoryAssetKeys = createCategoryFetchAnProcess(
  CategoryKeyableSubtype.Asset
);
