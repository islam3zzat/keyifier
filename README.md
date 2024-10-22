# Keyifier

This repository contains scripts that perform the following actions in commercetools Composable Commerce Projects:

- Querying how many of your resources requires keys.
- Applying boilerplate `key` values to resources.

These scripts are intended to prepare Composable Commerce Projects for the new [import](https://docs.commercetools.com/merchant-center/import-data)/[export](https://docs.commercetools.com/merchant-center/export-data) feature in the Merchant Center, which use `key` values as identifiers when updating resources.

## Requirements

You require an API Client with admin rights. After cloning this repository, create an `.env` file containing the API Client credentials as outlined in `example.env`.

After cloning the repository, install the dependencies using the command:

```bash
npm install
```

## Check how many resources require keys

Run the script "Check keys" using the command:

```bash
node checkWhatKeysNeeded
```

You can select what endpoint to query, and also receive a list of IDs.

## Automatically apply keys to non-Product resources

> [!CAUTION]  
> This action applies boilerplate values to resources which do not currently have a `key`. If you have a preferred format or pattern for keys, then modify the code or update them seperately.

Run the script "Set keys for non-Product resources" using the following command:

```bash
node updateOtherKeys
```

This script applies `key` values using the format: `resourceType_resourceId`. For example `categories_9a265100-2997-46d4-affc-2d140efd64ae`. In most cases, this should result in unique keys being applied.