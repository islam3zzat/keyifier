import dotenv from "dotenv";
import {
  getBearerToken,
  makeAPIRequests,
  revokeBearerToken,
} from "./functions.js";
import { Prompter } from "./prompter.js";
dotenv.config();

// Environment variables
const CTP_PROJECT_KEY = process.env.CTP_PROJECT_KEY;
const CTP_API_URL = process.env.CTP_API_URL;

// Get the bearer token
const bearerToken = await getBearerToken();
// Predicates for Categories and Category Assets
const whereCategory = "key is not defined";
const whereCategoryAsset = "assets is not empty and assets(key is not defined)";

// Used for indexing
export const resourceTypes = ["Categories", "Category Assets"];

// Queries and updates values on Category Assets (isAssets=true) or Categories (isAssets=false|undefined)
async function updateValues(isAssets) {
  const where = isAssets ? whereCategoryAsset : whereCategory;
  const returnedFields = isAssets ? "id version assets{ id }" : "id version";

  // Set up counter
  let count = 500;

  // Loop while count > 0
  do {
    try {
      // Get up to 500 of the resource
      const queryResults = await makeAPIRequests([
        {
          url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
          options: {
            method: "POST",
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `query{ categories(limit:500, where:"${where}"){ count results{ ${returnedFields} }}}`,
            }),
          },
        },
      ]);

      // Update the counter with the actual number of results
      count = queryResults[0].categories.count;

      // Only make update calls when there are results
      if (count > 0) {
        if (isAssets) {
          const updateCalls = queryResults[0].categories.results.map(
            ({ id, version, assets }) => {
              // Make actions for each Asset to update
              const actions = assets
                .map(
                  (asset) =>
                    `{ setAssetKey: { assetId: "${asset.id}", assetKey: "categories_${id}_assets_${asset.id}" } }`
                )
                .join(" ");

              return {
                url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                options: {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${bearerToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    query: `mutation { updateCategory(id: "${id}", version: ${version}, actions: [${actions}]) { id }}`,
                  }),
                },
              };
            }
          );

          await makeAPIRequests(updateCalls);
        } else {
          const updateCalls = queryResults[0].categories.results.map(
            (result) => ({
              url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
              options: {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${bearerToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  query: `mutation {updateCategory(id: "${result.id}", version: ${result.version}, actions: [{setKey: {key: "categories_${result.id}"}}]) { id }}`,
                }),
              },
            })
          );

          await makeAPIRequests(updateCalls);
        }
      }
    } catch (error) {
      throw new Error(`❌  An error occurred:\n ${error}`);
    }
  } while (count > 0);

  isAssets
    ? console.log(`Finished applying keys to Category Assets.`)
    : console.log(`Finished applying keys to Categories.`);
}

export async function applyCategoryKeys(selectedResource) {
  const prompter = new Prompter();

  // Get the array indexes of answers
  const answersIndex = selectedResource.map((choice) =>
    resourceTypes.indexOf(choice)
  );

  let whereQueries = [];
  if (selectedResource.includes("Categories")) {
    whereQueries.push(whereCategory);
  }
  if (selectedResource.includes("Category Assets")) {
    whereQueries.push(whereCategoryAsset);
  }

  // Contains the results of each query
  let queryResults = [];

  try {
    // Construct GraphQL calls for each resource type
    const queryCalls = whereQueries.map((where) => ({
      url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
      options: {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `query{ categories(where:"${where}"){ total }}`,
        }),
      },
    }));

    // Results from each call
    queryResults = await makeAPIRequests(queryCalls);
  } catch (error) {
    throw new Error(`❌  An error occurred:\n ${error}`);
  }

  // Put the GraphQL response into a key-value object. For example: {discountCodes: 23, standalonePrices: 5}
  const processedResults = answersIndex.reduce((acc, index) => {
    const key = index;
    acc[key] = queryResults[answersIndex.indexOf(index)].categories.total;
    return acc;
  }, {});

  console.log("Results: ");

  // Loop through the selected resource types and display how many need keys
  let keysNeededForTheseResources = [];

  for (let i = 0; i < answersIndex.length; i++) {
    if (answersIndex[i] === 0) {
      console.log(`${processedResults["0"]} Categories need keys.`);
      keysNeededForTheseResources.push(0);
    }

    if (answersIndex[i] === 1) {
      console.log(
        `${processedResults["1"]} Categories have Assets that need keys.`
      );
      keysNeededForTheseResources.push(1);
    }
  }

  console.log("---");

  // Prompt user to update resources which need keys
  if (keysNeededForTheseResources.length > 0) {
    const updateAnswers = await prompter.promptForResourceSelection(
      keysNeededForTheseResources
    );

    const resourcesToUpdateIndex = Array.isArray(
      updateAnswers.resourcesToUpdate
    )
      ? updateAnswers.resourcesToUpdate.map((choice) =>
          resourceTypes.indexOf(choice)
        )
      : [resourceTypes.indexOf(updateAnswers.resourcesToUpdate)];

    // Loop over the array of endpoint indexes and update their keys.
    for (let i = 0; i < resourcesToUpdateIndex.length; i++) {
      await updateValues(resourcesToUpdateIndex[i] === 1);
    }
  }

  // Clean up
  await revokeBearerToken(bearerToken);

  console.log("✔️  Finished");
}
