import dotenv from 'dotenv';
dotenv.config();

// Environment variables
const CTP_PROJECT_KEY = process.env.CTP_PROJECT_KEY;
const CTP_CLIENT_SECRET = process.env.CTP_CLIENT_SECRET;
const CTP_CLIENT_ID = process.env.CTP_CLIENT_ID;
const CTP_AUTH_URL = process.env.CTP_AUTH_URL;
const CTP_API_URL = process.env.CTP_API_URL;
const CTP_SCOPES = process.env.CTP_SCOPES;

// Endpoints to apply keys to.
// TODO: Add more endpoints if necessary. Consult the commercetools docs for information.
const endpoints = [
    "cart-discounts", // Required as Discount Codes reference them
    "categories",
    "customer-groups", // Required as Prices can reference them
    "discount-codes",
    "inventory",
    "product-types", // Required as Products reference them
    "tax-categories" // Required as Products reference them
];

// TODO: Add more endpoints if necessary. Consult the commercetools docs for information.
const resourceTypes = {
    "cart-discounts": { "label": "Cart Discounts", "singular": "Cart Discount" },
    "categories": { "label": "Categories", "singular": "Category" },
    "customer-groups": { "label": "Customer Groups", "singular": "Customer Group" },
    "discount-codes": { "label": "Discount Codes", "singular": "Discount Code" },
    "inventory": { "label": "Inventory Entries", "singular": "Inventory Entry" },
    "product-types": { "label": "Product Types", "singular": "Product Type" },
    "products": { "label": "Products", "singular": "Product" },
    "tax-categories": { "label": "Tax Categories", "singular": "Tax Category" },
}

// This is required as some update actions are "changeKey"
const changeKeyEndpoints = [
    "channels"
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

// Parallel API calls to get the "results" of each PagedQueryResponse
async function queryResources(arrayOfRequests) {
    const promises = arrayOfRequests.map(({ url, options }) => fetch(url, options));

    try {
        const responses = await Promise.all(promises);
        const data = await Promise.all(responses.map(res => res.json()));

        let results = [];
        for (let i = 0; i < data.length; i++) {
            results.push(data[i].results)
        }
        return results;
    } catch (error) {
        console.error('❌  Error querying resources:', error);
    }
}

// Parallel API calls for carrying out update actions
async function updateResources(arrayOfRequests) {
    const promises = arrayOfRequests.map(({ url, options }) => fetch(url, options));

    try {
        const responses = await Promise.all(promises);
        const data = await Promise.all(responses.map(res => res.json()));
        return data;
    } catch (error) {
        console.error('❌ Error updating resources: ', error);
    }
}

console.clear();
console.log("Starting...");

// Get the bearer token
const bearerToken = await getBearerToken();

console.log("✔️  Got bearer token.");

// Construct the query calls which return resources in each endpoint where a key is not defined
const queryCalls = endpoints.map(endpoint => ({
    url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/${endpoint}?limit=500&where=key+is+not+defined`,
    options: {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
        }
    }
}));

// Store the results arrays of each call
const results = await queryResources(queryCalls);

let updatesRequired = false;
for (let i = 0; i < endpoints.length; i++) {

    if (results[i].length > 0) {
        console.log(`${results[i].length} ${endpoints[i]} need keys.`);
        updatesRequired = true;
    }
}

if (!updatesRequired) {
    console.log("🏁 There are no resources that need keys.")
    process.exit();
}

// Construct update actions for every resource which must be updated
const updateCalls = endpoints.flatMap((endpoint, i) =>
    results[i].map(result => ({
        url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/${endpoint}/${result.id}`,
        options: {
            method: "POST",
            body: JSON.stringify({
                version: result.version,
                actions: [{
                    action: changeKeyEndpoints.includes(endpoint) ? "changeKey" : "setKey",
                    // TODO: The intention of this script is purely to set unique keys for import/export purposes. It does this by using the resource id and the endpoint. An example key is: "categories_aea4caed-accf-4667-adfe-be08ba6fdf91". You should ideally make a better formula for a key value.
                    key: `${endpoint}_${result.id}`
                }]
            }),
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            }
        }
    }))
);

console.log("Updating...");

// Carry out the update actions
await updateResources(updateCalls);

console.log("🏁 Finished.")