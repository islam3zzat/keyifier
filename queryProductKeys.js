import inquirer from 'inquirer';
import dotenv from 'dotenv';
dotenv.config();
import { getBearerToken, makeAPIRequests } from './functions.js';

const CTP_PROJECT_KEY = process.env.CTP_PROJECT_KEY;
const CTP_API_URL = process.env.CTP_API_URL;

// Console input starts
console.clear();

// Get the bearer token
const bearerToken = await getBearerToken();

console.log("Starting...");

applyProductKeys();


async function applyProductKeys() {

    let totalProductsResponse = await makeAPIRequests([{
        url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
        options: {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `query{products(where:"key is not defined"){total}}`
            })
        }
    }]);

    const total = totalProductsResponse[0].products.total;

    console.log(`${total} Products need keys.`)


    if (total > 0) {

        console.log("Updating Product keys...")

        let count = 500;

        do {

            try {
                // Get up to 500 Products
                const queryResults = await makeAPIRequests([{
                    url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                    options: {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${bearerToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            query: `query{ products(limit:500, where:"key is not defined"){ count results{ id version }}}`
                        })
                    }
                }])

                // Update the counter
                count = queryResults[0].products.count;

                // Update keys
                if (count > 0) {

                    const updateCalls = queryResults[0].products.results.map(result => ({
                        url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                        options: {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${bearerToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                query: `mutation { updateProduct(id: "${result.id}", version: ${result.version}, actions: [{setKey: {key: "products_${result.id}"}}]) { id }}`
                            })
                        }
                    }));

                    await makeAPIRequests(updateCalls);
                }
            }
            catch (error) {
                console.error('❌  An error occurred: ', error);
            }

        } while (count > 0)

        console.log("Finished applying Keys to Products.")
    }
}

async function applyProductVariantKeys() {

}

/*
do {


    current++;
} while (current < total)*/



/*
async function fetchProduct(current) {
    try {
        const response = await fetch(`${CTP_API_URL}/${CTP_PROJECT_KEY}/products?sort=createdAt+asc&limit=1&offset=${current}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.log(response)
            throw new Error(`❌  HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌  Error getting Product:', error);
    }
}

function compareCurrentStagedKeyValues(currentValue, stagedValue) {

    if (stagedValue && currentValue) {
        // If both keys exist, compare their values
        if (currentValue === stagedValue) {
            //return "The keys exist in both objects and they match.";
            return "";
        } else {
            //return "The keys exist in both objects but they do not match.";
            return "";
        }
    } else if (stagedValue) {
        //return "The key only exists in the staged object.";
        return stagedValue;
    } else if (currentValue) {
        //return "The key only exists in the current object.";
        return currentValue;
    } else {
        //return "The key does not exist in either object.";
        return "generate"
    }
}

console.clear();
console.log("Starting...");

// Get the bearer token
const bearerToken = await getBearerToken();

console.log("✔️  Got bearer token.");

let current = 2725;
let total = 0;

do {

    const actions = [];

    // Get Product
    const response = await fetchProduct(current)
    total = response.total;
    const product = response.results[0];



    console.log(`Processing: ${current}/${total} Products`)

    console.log(`ID: ${product.id}`);
    // Do both current/staged

    // Check if exists, add to update action

    // If there is no key, then add the action
    if (!product.key) {
        console.log("Needs key")
        actions.push({
            "action": "setKey",
            "key": `product_${product.id}`
        })
    }

    // Master variant
    console.log("Start masterVariant")

    console.log("masterVariant key:")

    let masterVariantKey = compareCurrentStagedKeyValues(product.masterData.current.masterVariant.key, product.masterData.staged.masterVariant.key);
    if (masterVariantKey != "") {
        if (masterVariantKey === "generate") { masterVariantKey = `product_${product.id}_variant_1` }

        console.log("masterVariant needs key")
        actions.push({
            "action": "setProductVariantKey",
            "variantId": 1,
            "key": masterVariantKey,
            "staged": false
        })
    };


    console.log("masterVariant prices:")
    let masterVariantPriceKeys = [];
    let length = product.masterData.current.masterVariant.prices.length > product.masterData.staged.masterVariant.prices.length ? product.masterData.current.masterVariant.prices.length : product.masterData.staged.masterVariant.prices.length;
    for (let i = 0; i < length; i++) {

    }








    console.log("masterVariant prices")
    for (let i = 0; i < product.masterData.current.masterVariant.prices.length; i++) {

        console.log(product.masterData.current.masterVariant.prices[i].key)
    }

    for (let i = 0; i < product.masterData.staged.masterVariant.prices.length; i++) {

        console.log(product.masterData.staged.masterVariant.prices[i].key)
    }

    console.log("masterVariant assets")
    for (let i = 0; i < product.masterData.current.masterVariant.assets.length; i++) {

        console.log(product.masterData.current.masterVariant.assets[i].key)
        console.log(product.masterData.staged.masterVariant.assets[i].key)
    }

    //console.log(product.masterData.current.variants)
    //console.log(product.masterData.staged.variants)
    for (let variant = 0; variant < product.masterData.current.variants.length; variant++) {

        console.log(variant + " prices")

        let pricesWithKeys = product.masterData.current.variants[variant].prices.length === 0 ? "staged" : "current"

        for (let i = 0; i < product.masterData[pricesWithKeys].variants[variant].prices.length; i++) {

            console.log(product.masterData[pricesWithKeys].variants[variant].prices[i].key)
            console.log(product.masterData[pricesWithKeys].variants[variant].prices[i].key)
        }

        console.log(variant + " assets")
        for (let i = 0; i < product.masterData.current.variants[variant].assets.length; i++) {

            console.log(product.masterData.current.variants[variant].assets[i].key)
            console.log(product.masterData.staged.variants[variant].assets[i].key)
        }
    }


    // Variants/Master Variant
    // Prices
    // Assets

    if (actions.length > 0) {
        // Perform updates
    }

    current++;

} while (current < total)

console.log("🏁 Finished.")*/