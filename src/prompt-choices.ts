import * as product from "./api/product/index.js";
import * as category from "./api/category/index.js";
import * as otherResources from "./api/resource/index.js";

export type PromptOption = {
  choice: string;
  action: () => Promise<void>;
};

const productActions: PromptOption[] = [
  {
    choice: "Apply keys to Products",
    action: product.fetchAndProcessProductKeys,
  },
  {
    choice: "Apply keys to Product Variants",
    action: product.fetchAndProcessProductVariantKeys,
  },
  {
    choice: "Apply keys to Product Prices",
    action: product.fetchAndProcessProductPriceKeys,
  },
  {
    choice: "Apply keys to Product Assets",
    action: product.fetchAndProcessProductAssetKeys,
  },
];

const categoryActions: PromptOption[] = [
  {
    choice: "Apply keys to Categories",
    action: category.fetchAndProcessCategoryKeys,
  },
  {
    choice: "Apply keys to Category Assets",
    action: category.fetchAndProcessCategoryAssetKeys,
  },
];

const otherActions: PromptOption[] = [
  {
    choice: "Apply keys to DiscountCode",
    action: otherResources.fetchAndProcessDiscountCodeKeys,
  },
  {
    choice: "Apply keys to CartDiscount",
    action: otherResources.fetchAndProcessCartDiscountKeys,
  },
  {
    choice: "Apply keys to CustomerGroup",
    action: otherResources.fetchAndProcessCustomerGroupKeys,
  },
  {
    choice: "Apply keys to Customer",
    action: otherResources.fetchAndProcessCustomerKeys,
  },
  {
    choice: "Apply keys to ProductType",
    action: otherResources.fetchAndProcessProductTypeKeys,
  },
  {
    choice: "Apply keys to StandalonePrice",
    action: otherResources.fetchAndProcessStandalonePriceKeys,
  },
  {
    choice: "Apply keys to TaxCategory",
    action: otherResources.fetchAndProcessTaxCategoryKeys,
  },
];

export const promptChoicesMap: Record<string, PromptOption[]> = {
  productKeys: productActions,
  categoryKeys: categoryActions,
  otherKeys: otherActions,
};
