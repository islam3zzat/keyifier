import inquirer from 'inquirer';
import dotenv from 'dotenv';
dotenv.config();
import { getBearerToken, makeAPIRequests } from './functions.js';

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

// Console input starts
console.clear();

// Prompt the user to select the resource types.
const answers = await inquirer.prompt([
    {
        type: 'checkbox',
        name: 'selectedEndpoints',
        message: 'Select the resource types to query:',
        choices: endpoints
    }
]);

// Contains the results of each query
let queryResults = [];

// Get the bearer token
const bearerToken = await getBearerToken();

try {
    // Construct GraphQL calls for each resource type
    const queryCalls = answers.selectedEndpoints.map(endpoint => ({
        url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
        options: {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `query{ ${endpoint}(limit:500, where:"key is not defined"){ results{ id version }}}`
            })
        }
    }));

    // Results from each call
    queryResults = await makeAPIRequests(queryCalls)
}
catch (error) {
    throw new Error(`❌  An error occurred:\n ${error}`);
}

// Put the GraphQL response into a workable array
const processedResults = queryResults.reduce((acc, item) => {
    const key = Object.keys(item)[0];
    acc[key] = item[key].results;
    return acc;
}, {});

let keysAreNeeded = [];

// Loop through the selected resource types and display how many need keys
console.log("Results: ")
for (let i = 0; i < answers.selectedEndpoints.length; i++) {
    console.log(`${processedResults[answers.selectedEndpoints[i]].length} ${answers.selectedEndpoints[i]} need keys.`)
    if (processedResults[answers.selectedEndpoints[i]].length > 0) { keysAreNeeded.push(endpoints.indexOf(answers.selectedEndpoints[i])) }
}

console.log("---")

// Prompt user to update resources which need keys
if (keysAreNeeded.length > 0) {

    const updateCallPrompt = await inquirer.prompt([
        {
            type: keysAreNeeded.length === 1 ? "select" : 'checkbox',
            name: 'endpointsToUpdate',
            message: 'Select the resources to apply keys to:',
            choices: keysAreNeeded.map(index => endpoints[index])
        }
    ]);

    try {

        for (let i = 0; i < keysAreNeeded.length; i++) {
            if (updateCallPrompt.endpointsToUpdate.includes(endpoints[keysAreNeeded[i]])) {
                const updateCalls = [];

                for (let ii = 0; ii < processedResults[endpoints[keysAreNeeded[i]]].length; ii++) {

                    // Special case as this update action is missing from GraphQL
                    if (endpoints[keysAreNeeded[i]] === "inventoryEntries") {
                        updateCalls.push({
                            url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/inventory/${processedResults[endpoints[keysAreNeeded[i]]][ii].id}`,
                            options: {
                                method: 'POST',
                                headers: {
                                    Authorization: `Bearer ${bearerToken}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    version: processedResults[endpoints[keysAreNeeded[i]]][ii].version,
                                    actions: [
                                        {
                                            action: "setKey",
                                            key: `inventoryEntries_${processedResults[endpoints[keysAreNeeded[i]]][ii].id}`
                                        }
                                    ]
                                })
                            }
                        })
                    }
                    else {

                    updateCalls.push({
                        url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                        options: {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${bearerToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                query: `mutation { ${postEndpoints[keysAreNeeded[i]]}(id: "${processedResults[endpoints[keysAreNeeded[i]]][ii].id}", version: ${processedResults[endpoints[keysAreNeeded[i]]][ii].version}, actions: [{setKey: {key: "${endpoints[keysAreNeeded[i]]}_${processedResults[endpoints[keysAreNeeded[i]]][ii].id}"}}]) { id }}`
                            })
                        }
                    })
                }
                }

                await makeAPIRequests(updateCalls)
            }
        }
    }
    catch (error) {
        throw new Error(`❌  An error occurred:\n ${error}`);
    }

    console.log("---")
    console.log("Finished");
}