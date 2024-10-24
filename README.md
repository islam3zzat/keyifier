# Keyifier

This repository contains scripts that perform the following actions in commercetools Composable Commerce Projects:

- Querying how many of your resources requires keys.
- Applying boilerplate `key` values to resources.

These scripts are intended to prepare Composable Commerce Projects for the new [import](https://docs.commercetools.com/merchant-center/import-data) and [export](https://docs.commercetools.com/merchant-center/export-data) features in the Merchant Center, which use `key` values as identifiers when updating resources.

## Set up

1. Clone this repository.
2. Install the dependencies using the command:
    ```bash
    npm install
    ```
3. Create an [API Client](https://docs.commercetools.com/getting-started/create-api-client) that can manage:
    - Cart Discounts
    - Categories
    - Customer Groups
    - Discount Codes
    - Products
    - Standalone Prices
    - Tax Categories
4. Download the **Environment Variables (.env)** for this API Client, rename the downloaded file `.env`, and copy it to the cloned repository.


## Available scripts

> [!CAUTION]  
> These scripts apply boilerplate values to resources which do not currently have a `key`. If you have a preferred format or pattern for keys, then modify the code or update the resources seperately.

There are two scripts available:

- Query and apply keys (non-Products)
- Query and apply keys (Products)

The non-Products script will prompt you to select the resource types to query and update.

Due to the complexity of Products, updating their keys has its own script.

### Query and apply keys (non-Products)

Run the script with the following command:

```bash
node queryKeys
```

You will be prompted to select the resource types to query.

If the queried resource types have resources without keys, you will be prompted to apply keys to them.

This script applies `key` values using the format:  `{resourceType}_{resourceId}`. For example `categories_9a265100-2997-46d4-affc-2d140efd64ae`. In 99% of cases, this should result in unique keys being applied.

Due to limits of Composable Commerce APIs, you must run this script multiple times if you have over `500` resources of one resource type that require keys.

### Query and apply keys (Products)

You can run the script with the following command:

```bash
node queryProductKeys
```

This script applies `key` values to:

- Products
- Product Variants
- Product Prices
- Product Assets

This includes `current` and `staged` projections.

This script applies `key` values using the format: `resourceType_resourceId`. For example `product_bd0189b6-a2bc-4f49-8ca9-40919d1bd69e_variant_1_prices_1f70441a-bfdc-4ae3-b07a-3fba8facc0ac`. In most cases, this should result in unique keys being applied.

This script may take a long time to complete depending on how many Products, Product Variants, Prices, and Assets you have.

