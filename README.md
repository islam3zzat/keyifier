# Keyifier

This repository contains scripts that perform the following actions in commercetools Composable Commerce Projects:

- Querying how many of your resources requires keys.
- Applying boilerplate `key` values to resources.

These scripts are intended to prepare Composable Commerce Projects for the new [import](https://docs.commercetools.com/merchant-center/import-data) and [export](https://docs.commercetools.com/merchant-center/export-data) features in the Merchant Center, which use `key` values as identifiers when updating resources.

## Requirements

You require an [API Client](https://docs.commercetools.com/getting-started/create-api-client) with admin rights.

After cloning this repository, create an `.env` file containing the API Client credentials as outlined in [example.env](https://github.com/industrian/keyifier/blob/master/example.env).

Also, remember to install the dependencies using the command:

```bash
npm install
```

## Available scripts

### Check how many resources require keys

Run the script "Check keys" using the command:

```bash
node checkWhatKeysNeeded
```

You can select what endpoint to query, and also receive a list of IDs.

### Automatically apply keys to non-Product resources

> [!CAUTION]  
> This action applies boilerplate values to resources which do not currently have a `key`. If you have a preferred format or pattern for keys, then modify the code or update them seperately.

Run the script "Set keys for non-Product resources" using the following command:

```bash
node updateOtherKeys
```

This script applies `key` values using the format: `resourceType_resourceId`. For example `categories_9a265100-2997-46d4-affc-2d140efd64ae`. In most cases, this should result in unique keys being applied.

Due to limits of the Composable Commerce APIs, you will need to run this script multiple times if you have over `500` resources of one resource type that require keys.


### Automatically apply keys to non-Product resources

> [!CAUTION]  
> This action applies boilerplate values to resources which do not currently have a `key`. If you have a preferred format or pattern for keys, then modify the code or update them seperately.

Run the script "Set keys for Products" using the following command:

```bash
node updateProductKeys
```

This script will apply `key` values to:

- Products
- Product Variants
- Product Prices
- Product Assets

This script applies `key` values using the format: `resourceType_resourceId`. For example `product_bd0189b6-a2bc-4f49-8ca9-40919d1bd69e_variant_1_prices_1f70441a-bfdc-4ae3-b07a-3fba8facc0ac`. In most cases, this should result in unique keys being applied.

This script may take a long time to complete depending on how many Products, Product Variants, Prices, and Assets you have.

