import { Product } from "@commercetools/platform-sdk";
import { waitForNextRequest } from "../../utils/fairness";
import { fetchProducts, fetchVariants } from "./fetch-products";
import { setProductKey, setProductVariantsKeys } from "./update-product";

export const fetchAndProcessProducts = async (lastId?: string) => {
  const [error, body] = await fetchProducts(lastId);

  if (error) {
    console.error("Error fetching products:", error);
    return;
  }

  const products: Product[] = body.results;
  const lastProduct = products[products.length - 1];

  if (!lastProduct) {
    console.log("All products have been processed");
    return;
  }

  let processedProducts = 0;
  for (const product of products) {
    await setProductKey(product);

    processedProducts++;
    console.log(`Processed ${processedProducts} products`);

    await waitForNextRequest();
  }

  await fetchAndProcessProducts(lastProduct.id);
};
