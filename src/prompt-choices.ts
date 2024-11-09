import * as resource from "./api/resource/index.js";

export type PromptOption = {
  choice: string;
  action: () => Promise<void>;
};

const productActions: PromptOption[] = [
  {
    choice: "Apply keys to Products",
    action: resource.fetchAndProcessProductKeys,
  },
  {
    choice: "Apply keys to Product Variants",
    action: resource.fetchAndProcessProductVariantKeys,
  },
  {
    choice: "Apply keys to Product Prices",
    action: resource.fetchAndProcessProductPriceKeys,
  },
  {
    choice: "Apply keys to Product Assets",
    action: resource.fetchAndProcessProductAssetKeys,
  },
];

const categoryActions: PromptOption[] = [
  {
    choice: "Apply keys to Categories",
    action: resource.fetchAndProcessCategoryKeys,
  },
  {
    choice: "Apply keys to Category Assets",
    action: resource.fetchAndProcessCategoryAssetKeys,
  },
];

const otherActions: PromptOption[] = [
  {
    choice: "Apply keys to DiscountCode",
    action: resource.fetchAndProcessDiscountCodeKeys,
  },
  {
    choice: "Apply keys to CartDiscount",
    action: resource.fetchAndProcessCartDiscountKeys,
  },
  {
    choice: "Apply keys to CustomerGroup",
    action: resource.fetchAndProcessCustomerGroupKeys,
  },
  {
    choice: "Apply keys to Customer",
    action: resource.fetchAndProcessCustomerKeys,
  },
  {
    choice: "Apply keys to ProductType",
    action: resource.fetchAndProcessProductTypeKeys,
  },
  {
    choice: "Apply keys to StandalonePrice",
    action: resource.fetchAndProcessStandalonePriceKeys,
  },
  {
    choice: "Apply keys to TaxCategory",
    action: resource.fetchAndProcessTaxCategoryKeys,
  },
];

export const promptChoicesMap: Record<string, PromptOption[]> = {
  productKeys: productActions,
  categoryKeys: categoryActions,
  otherKeys: otherActions,
};
