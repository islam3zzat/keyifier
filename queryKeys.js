import inquirer from 'inquirer';
import dotenv from 'dotenv';
dotenv.config();
import { getBearerToken, makeAPIRequests, revokeBearerToken } from './functions.js';

// Environment variables
const CTP_PROJECT_KEY = process.env.CTP_PROJECT_KEY;
const CTP_API_URL = process.env.CTP_API_URL;

// Endpoints to query. These are the GraphQL endpoints, not HTTP API ones.
// TODO: Add more endpoints if necessary.
const endpoints = [
    "cartDiscounts",
    "customerGroups",
    "customers",
    "discountCodes",
    "inventoryEntries",
    "productTypes",
    "standalonePrices",
    "taxCategories",
];

// Endpoints to make updates to. These are the GraphQL endpoints, not the HTTP API ones.
// TODO: Add more endpoints if necessary.
const postEndpoints = [
    "updateCartDiscount",
    "updateCustomerGroup",
    "updateCustomer",
    "updateDiscountCode",
    "updateInventoryEntry",
    "updateProductType",
    "updateStandalonePrice",
    "updateTaxCategory"
]

// Used to return a formatted endpoint ("discountCodes" becomes "Discount Codes")
function returnSentenceCasedString(stringValue) {
    return (stringValue.charAt(0).toUpperCase() + stringValue.slice(1)).split(/(?=[A-Z])/).join(" ");
}

// Queries and updates values on the specified index
async function updateValues(endpointIndex) {

    // Set up counter
    let count = 500;

    // Loop while count > 0
    do {
        try {
            // Get up to 500 of the resource
            const queryResults = await makeAPIRequests([{
                url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                options: {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${bearerToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: `query{ ${endpoints[endpointIndex]}(limit:500, where:"key is not defined"){ count results{ id version }}}`
                    })
                }
            }])

            // Update the counter with the actual number of results
            count = queryResults[0][endpoints[endpointIndex]].count;

            // Only make update calls when there are results
            if (count > 0) {

                // Special case as this update action is missing from GraphQL
                if (endpoints[endpointIndex] === "inventoryEntries") {
                    const updateCalls = queryResults[0][endpoints[endpointIndex]].results.map(result => ({
                        url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/inventory/${result.id}`,
                        options: {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${bearerToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                version: result.version,
                                actions: [
                                    {
                                        action: "setKey",
                                        key: `inventoryEntries_${result.id}`
                                    }
                                ]
                            })
                        }
                    }));

                    await makeAPIRequests(updateCalls);
                }
                else {
                    // Everything else uses GraphQL
                    const updateCalls = queryResults[0][endpoints[endpointIndex]].results.map(result => ({
                        url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                        options: {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${bearerToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                query: `mutation { ${postEndpoints[endpointIndex]}(id: "${result.id}", version: ${result.version}, actions: [{setKey: {key: "${endpoints[endpointIndex]}_${result.id}"}}]) { id }}`
                            })
                        }
                    }));

                    await makeAPIRequests(updateCalls);
                }
            }
        }
        catch (error) {
            throw new Error(`❌  An error occurred:\n ${error}`);
        }

    } while (count > 0)

    console.log(`Finished applying keys to ${returnSentenceCasedString(endpoints[endpointIndex])}.`)
}

// Console input starts
console.clear();

// Prompt the user to select the resource types.
const answers = await inquirer.prompt([
    {
        type: 'checkbox',
        name: 'selectedEndpoints',
        message: 'Select the resource types to query:',
        choices: endpoints.map(returnSentenceCasedString)
    }
]);

// Get the array indexes of answers
const answersIndex = answers.selectedEndpoints.map(choice => endpoints.map(returnSentenceCasedString).indexOf(choice));

// Contains the results of each query
let queryResults = [];

// Get the bearer token
const bearerToken = await getBearerToken();

try {
    // Construct GraphQL calls for each resource type
    const queryCalls = answersIndex.map(endpointIndex => ({
        url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
        options: {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `query{ ${endpoints[endpointIndex]}(where:"key is not defined"){ total }}`
            })
        }
    }));

    // Results from each call
    queryResults = await makeAPIRequests(queryCalls)
}
catch (error) {
    throw new Error(`❌  An error occurred:\n ${error}`);
}

// Put the GraphQL response into a key-value object. For example: {discountCodes: 23, standalonePrices: 5}
const processedResults = queryResults.reduce((acc, item) => {
    const key = Object.keys(item)[0];
    acc[key] = item[key].total;
    return acc;
}, {});

console.log("Results: ")

// Loop through the selected resource types and display how many need keys
let keysNeededForTheseEndpoints = [];
for (let i = 0; i < answersIndex.length; i++) {
    console.log(`${processedResults[endpoints[answersIndex[i]]]} ${returnSentenceCasedString(endpoints[answersIndex[i]])} need keys.`)
    if (processedResults[endpoints[answersIndex[i]]] > 0) { keysNeededForTheseEndpoints.push(i) }
}

console.log("---")

// Prompt user to update resources which need keys
if (keysNeededForTheseEndpoints.length > 0) {

    const updateAnswers = await inquirer.prompt([
        {
            type: keysNeededForTheseEndpoints.length === 1 ? "select" : 'checkbox',
            name: 'endpointsToUpdate',
            message: 'Select the resources to apply keys to:',
            choices: keysNeededForTheseEndpoints.map(index => returnSentenceCasedString(endpoints[index]))
        }
    ]);

    // Create an array of endpoint indexes.
    const endpointsToUpdateIndex = Array.isArray(updateAnswers.endpointsToUpdate) ? updateAnswers.endpointsToUpdate.map(choice => endpoints.map(returnSentenceCasedString).indexOf(choice)) : [endpoints.map(returnSentenceCasedString).indexOf(updateAnswers.endpointsToUpdate)];

    // Loop over the array of endpoint indexes and update their keys.
    for (let i = 0; i < endpointsToUpdateIndex.length; i++) {
        await updateValues(endpointsToUpdateIndex[i])
    }
}

// Clean up
await revokeBearerToken(bearerToken);

console.log("✔️  Finished");
