This repository contains scripts that apply boilerplate `key` values to resources.

# What is this useful for?

Import and export functionality in Composable Commerce uses the `key` field as the identifier for resources. If your resources do not have a `key`, they cannot be updated via import and their references may be broken in exported files.

As the `key` value is optional, resources within your Composable Commerce Project may lack them.

These scripts apply boilerplate `key` values to resources, which enables you to fully use the import and export functions within Composable Commerce.

# How do I set this up?

1. Clone this repository.
2. Install the dependencies using the command:
    ```bash
    npm install
    ```
3. Create a commercetools Composable Commerce [API Client](https://docs.commercetools.com/getting-started/create-api-client) that can manage:
    - Cart Discounts
    - Categories
    - Customers
    - Customer Groups
    - Discount Codes
    - Products
    - Standalone Prices
    - Tax Categories
4. Download the **Environment Variables (.env)** for this API Client.
5. Rename the downloaded file `.env`, and copy it to the cloned repository.

# What scripts are available?

> [!CAUTION]  
> These scripts apply boilerplate values to resources which do not currently have a `key`.
>
> If you have a preferred format or pattern for keys, then modify the code or update the resources seperately.

The following scripts are available:

- [Query and apply keys (Categories)](#query-and-apply-keys-categories)
- [Query and apply keys (Products)](#query-and-apply-keys-products)
- [Query and apply keys (other)](#query-and-apply-keys-other)

## Query and apply keys (Categories)

This script applies `key` values to:

- Categories
- Category Assets

You can run this script with the following command:

```bash
node queryCategoryKeys
```

This script applies `key` values using the format: `resourceType_resourceId`. For example `categories_af206771-d70d-43e0-9e8a-2de76d8f7f94_assets_4b77be7f-ff3b-4cef-867d-09d473d335b1`. In most cases, this should result in unique keys being applied.

## Query and apply keys (Products)

This script applies `key` values to:

- Products
- Product Variants
- Product Prices
- Product Assets

You can run the script with the following command:

```bash
node queryProductKeys
```

This script applies `key` values using the format: `resourceType_resourceId`. For example `products_bd0189b6-a2bc-4f49-8ca9-40919d1bd69e_variant_1_prices_1f70441a-bfdc-4ae3-b07a-3fba8facc0ac`. In most cases, this should result in unique keys being applied.

This script may take a long time to complete depending on how many Products, Product Variants, Prices, and Assets you have.

## Query and apply keys (other)

Run the script with the following command:

```bash
node queryKeys
```

You will be prompted to select the resource types to apply keys to.

If the queried resource types have resources without keys, you will be prompted to apply keys to them.

This script applies `key` values using the format:  `{resourceType}_{resourceId}`. For example `customers_9a265100-2997-46d4-affc-2d140efd64ae`. In 99% of cases, this should result in unique keys being applied.
