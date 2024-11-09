import {
  productFetchers,
  categoryFetchers,
  otherFetchers,
} from "./api/resource/index.js";

function camelToPascalWithSpace(input: string) {
  return input
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
}
export type PromptOption = {
  choice: string;
  action: () => Promise<void>;
  fetchTotal: () => Promise<number | undefined>;
};

const productActions: PromptOption[] = productFetchers.map((fetcher) => ({
  choice: `Apply keys to ${camelToPascalWithSpace(fetcher.type)}`,
  action: fetcher.fetchProcess,
  fetchTotal: fetcher.fetchTotal,
}));

const categoryActions: PromptOption[] = categoryFetchers.map((fetcher) => ({
  choice: `Apply keys to ${camelToPascalWithSpace(fetcher.type)}`,
  action: fetcher.fetchProcess,
  fetchTotal: fetcher.fetchTotal,
}));

const otherActions: PromptOption[] = otherFetchers.map((fetcher) => ({
  choice: `Apply keys to ${camelToPascalWithSpace(fetcher.type)}`,
  action: fetcher.fetchProcess,
  fetchTotal: fetcher.fetchTotal,
}));

export const promptChoicesMap: Record<string, PromptOption[]> = {
  productKeys: productActions,
  categoryKeys: categoryActions,
  otherKeys: otherActions,
};
