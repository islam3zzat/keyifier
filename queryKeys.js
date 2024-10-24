import inquirer from 'inquirer';
import dotenv from 'dotenv';
dotenv.config();

// Environment variables
const CTP_PROJECT_KEY = process.env.CTP_PROJECT_KEY;
const CTP_CLIENT_SECRET = process.env.CTP_CLIENT_SECRET;
const CTP_CLIENT_ID = process.env.CTP_CLIENT_ID;
const CTP_AUTH_URL = process.env.CTP_AUTH_URL;
const CTP_API_URL = process.env.CTP_API_URL;
const CTP_SCOPES = process.env.CTP_SCOPES;

// Endpoints to query. These are the GraphQL endpoints, not the HTTP API ones.
// TODO: Add more endpoints if necessary.
const endpoints = [
    "cartDiscounts",
    "categories",
    "customerGroups",
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
    "updateCategory",
    "updateCustomerGroup",
    "updateDiscountCode",
    "updateInventoryEntry",
    "updateProductType",
    "updateStandalonePrice",
    "updateTaxCategory"
]

// Get the bearer token
async function getBearerToken() {
    try {
        const response = await fetch(`${CTP_AUTH_URL}/oauth/token?grant_type=client_credentials&scope=${CTP_SCOPES}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: "Basic " + btoa(CTP_CLIENT_ID + ":" + CTP_CLIENT_SECRET),
            }
        });

        if (!response.ok) {
            console.log(response)
            throw new Error(`❌  HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('❌  Error getting bearer token:', error);
    }
}

// Make API requests
async function makeAPIRequests(arrayOfRequests) {
    const promises = arrayOfRequests.map(({ url, options }) => fetch(url, options));
    try {
        const responses = await Promise.all(promises);
        const data = await Promise.all(responses.map(res => res.json()));
        return data.map(item => item.data);
    } catch (error) {
        console.error('❌  Error making API requests:', error);
    }
}

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
    console.error('❌  An error occurred:', error);
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

    const choices = keysAreNeeded.map(index => endpoints[index]);
    const versions = 0

    const updateCalls = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedEndpoints',
            message: 'Select the resources to apply keys to:',
            choices: keysAreNeeded.map(index => endpoints[index])
        }
    ]);

    try {

        for (let i = 0; i < keysAreNeeded.length; i++) {
            if (answers.selectedEndpoints.includes(endpoints[keysAreNeeded[i]])) {

                const updateCalls = [];

                for (let ii = 0; ii < processedResults[endpoints[keysAreNeeded[i]]].length; ii++) {
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

                await makeAPIRequests(updateCalls)
            }
        }
    }
    catch (error) {
        console.error('❌  An error occurred:', error);
    }

    console.log("---")
    console.log("Finished");
}