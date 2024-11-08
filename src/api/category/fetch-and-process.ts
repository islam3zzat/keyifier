import { Category } from "@commercetools/platform-sdk";
import { waitForNextRequest } from "../../utils/fairness.js";
import { fetchWithMissingKey } from "./fetch-categories.js";
import { setCategoryFieldKey } from "./update-category.js";
import { CategoryKeyableSubtype } from "./keyable-type/index.js";

const createCategoryFetchAnProcess = (type: CategoryKeyableSubtype) => {
  const fetcher = fetchWithMissingKey(type);
  const updater = setCategoryFieldKey(type);

  const fetchAndProcess = async (lastId?: string) => {
    const [error, body] = await fetcher(lastId);

    if (error) {
      console.error(`Error fetching ${type}:`, error);
      return;
    }

    const categories: Category[] = body.categories.results;
    const lastCategory = categories[categories.length - 1];

    if (!lastCategory) {
      console.log(`All ${type} have been processed`);
      return;
    }

    let processed = 0;
    for (const category of categories) {
      const updatedResources = await updater(category);

      processed += updatedResources;
      console.log(`Processed ${processed} ${type}`);

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
