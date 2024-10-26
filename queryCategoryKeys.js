import dotenv from 'dotenv';
import { getBearerToken, makeAPIRequests } from './functions.js';
dotenv.config();

// Environment variables
const CTP_PROJECT_KEY = process.env.CTP_PROJECT_KEY;
const CTP_API_URL = process.env.CTP_API_URL;

// Console input starts
console.clear();

// Get the bearer token
const bearerToken = await getBearerToken();

// Get all the Categories without keys
let withoutKeys = [];
try {
    // Get Categories without keys
    const queryKeys = [{
        url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
        options: {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `query{ categories(limit:500, where:"key is not defined"){ results{ id version }}}`
            })
        }
    }];

    // Results from each call
    withoutKeys = await makeAPIRequests(queryKeys)
}
catch (error) {
    console.error('❌  An error occurred:', error);
}

console.log(`${withoutKeys[0].categories.results.length} Categories need keys.`)

// Update the Categories with keys
try {
    if (withoutKeys[0].categories.results.length > 0) {
        console.log("Updating Category keys...")

        const updateCalls = withoutKeys[0].categories.results.map(result => ({
            url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
            options: {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: `mutation { updateCategory(id: "${result.id}", version: ${result.version}, actions: [{setKey: {key: "categories_${result.id}"}}]) { id }}`
                })
            }
        }));

        await makeAPIRequests(updateCalls)
    }
}
catch (error) {
    console.error('❌  An error occurred:', error);
}

// Get all the Categories which have Assets, but the Assets have no keys
let withoutAssetKeys = [];
try {
    // Construct GraphQL calls for Category Assets which need keys
    const queryAssetKeys = [{
        url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
        options: {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `query{ categories(limit:500 where:"assets is not empty and assets(key is not defined)"){ results{ id version assets{ id } } }}`
            })
        }
    }];

    // Results from each call
    withoutAssetKeys = await makeAPIRequests(queryAssetKeys)
}
catch (error) {
    console.error('❌  An error occurred:', error);
}

// Get total number of Assets needing keys
const assetsNeedingKeys = withoutAssetKeys[0].categories.results.reduce(
    (total, result) => total + result.assets.length,
    0
);
console.log(`${assetsNeedingKeys} Category Assets need keys.`)

// Update the Category Assets with keys
try {
    if (assetsNeedingKeys > 0) {
        console.log("Updating Category Asset keys...")

        const updateCalls = withoutAssetKeys[0].categories.results.map(({ id, version, assets }) => {

            // Make actions for each Asset to update
            const actions = assets.map(asset => (
                `{ setAssetKey: { assetId: "${asset.id}", assetKey: "categories_${id}_assets_${asset.id}" } }`
            )).join(' ');

            return {
                url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                options: {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${bearerToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: `mutation { updateCategory(id: "${id}", version: ${version}, actions: [${actions}]) { id }}`
                    })
                }
            };
        });

        await makeAPIRequests(updateCalls)
    }
}
catch (error) {
    console.error('❌  An error occurred:', error);
}