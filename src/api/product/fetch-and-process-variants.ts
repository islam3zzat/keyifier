import { Product } from "@commercetools/platform-sdk";
import { waitForNextRequest } from "../../utils/fairness";
import { fetchVariants } from "./fetch-products";
import { setProductVariantsKeys } from "./update-product";
export const fetchAndProcessVariants = async (lastId?: string) => {
  const [error, body] = await fetchVariants(lastId);

  if (error) {
    console.error("Error fetching variants:", error);
    return;
  }

  const products: Product[] = body.results;
  const lastProduct = products[products.length - 1];

  if (!lastProduct) {
    console.log("All product variants have been processed");
    return;
  }

  let processedVariants = 0;
  for (const product of products) {
    const updatedVariants = await setProductVariantsKeys(product);

    processedVariants += updatedVariants;
    console.log(`Processed ${processedVariants} variants`);

    await waitForNextRequest();
  }

  await fetchAndProcessVariants(lastProduct.id);
};
