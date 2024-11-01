import inquirer from 'inquirer';
import dotenv from 'dotenv';
dotenv.config();
import { getBearerToken, makeAPIRequests } from './functions.js';

const CTP_PROJECT_KEY = process.env.CTP_PROJECT_KEY;
const CTP_API_URL = process.env.CTP_API_URL;

// Console input starts
console.clear();

// Prompt the user to select the resource types.
const action = await inquirer.prompt([
    {
        type: 'select',
        name: 'selectAction',
        message: 'Select the action to perform:',
        choices: ["Apply keys to Products", "Apply keys to Product Variants", "Apply keys to Product Prices", "Apply keys to Product Assets"]
    }
]);

// Get the bearer token
const bearerToken = await getBearerToken();

switch (action.selectAction) {
    case "Apply keys to Products":
        await applyProductKeys();
        break;
    case "Apply keys to Product Variants":
        await applyProductVariantKeys();
        break;
    case "Apply keys to Product Prices":
        await applyProductPriceKeys();
        break;
    case "Apply keys to Product Assets":
        await applyProductAssetKeys();
        break;
    default:
        break;
}

function getArrayIndex(array, id) {

    for (let i = 0; i < array.length; i++) {
        if (array[i].id === id) { return i }
    }
    throw new Error(`❌  id does not exist in array: ${id}`);
}

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
                throw new Error(`❌  An error occurred:\n ${error}`);
            }

        } while (count > 0)

        console.log("Finished applying Keys to Products.")
    }
}

async function applyProductVariantKeys() {

    console.log("Updating Product Variant keys...")

    // Controls the do/while loop
    let count = 500;

    // Master Variant updates
    do {
        try {

            // Get all products that have a "null" MasterVariant key
            const queryResults = await makeAPIRequests([{
                url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                options: {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${bearerToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: `query{ products(limit: 500, where: "masterData(current(masterVariant(key is not defined)))") { count results { id version masterData {  current { masterVariant { id sku  key }  }  staged { masterVariant { id  sku key }  } } } }}`
                    })
                }
            }])

            // Update the counter            
            count = queryResults[0].products.count;

            let updates = new Array(queryResults[0].products.results.length);

            // Update keys
            if (count > 0) {

                for (let i = 0; i < queryResults[0].products.results.length; i++) {

                    // Set newMasterKey to the current master variant key
                    let newMasterKey = queryResults[0].products.results[i].masterData.current.masterVariant.key;

                    // If not set, use the staged
                    if (newMasterKey === null) {
                        newMasterKey = queryResults[0].products.results[i].masterData.staged.masterVariant.key
                    }

                    // If still null, then set to the current SKU, or to a set value
                    if (newMasterKey === null) {
                        newMasterKey = queryResults[0].products.results[i].masterData.current.masterVariant.sku === null ? queryResults[0].products.results[i].masterData.staged.masterVariant.sku : queryResults[0].products.results[i].masterData.current.masterVariant.sku;
                        if (newMasterKey === null) {
                            newMasterKey = `products_${queryResults[0].products.results[i].id}_variants_1`;
                        }
                    }

                    updates[i] = `{ setProductVariantKey: { variantId: ${queryResults[0].products.results[i].masterData.current.masterVariant.id}, key: "${newMasterKey}" staged: false } }`
                }

                const updateCalls = queryResults[0].products.results.map((result, index) => ({
                    url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                    options: {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${bearerToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            query: `mutation { updateProduct(id: "${result.id}", version: ${result.version}, actions: [${updates[index]}]) { id }}`
                        })
                    }
                }));

                await makeAPIRequests(updateCalls);
            }
        }
        catch (error) {
            throw new Error(`❌  An error occurred:\n ${error}`);
        }
    } while (count > 0)

    console.log("Finished applying Keys to Master Variants.")

    // Other variant updates

    // Reset counter
    count = 500;
    do {
        try {
            // Get all Products where Variants are present but their key is not defined
            const queryResults = await makeAPIRequests([{
                url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                options: {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${bearerToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: `query{ products(limit: 500, where: "masterData(current(variants is not empty and variants(key is not defined)))") { count results { id version   masterData {  current { variants { id sku  key } }  staged { variants { id sku  key } } } } }}`
                    })
                }
            }])

            // Update the counter            
            count = queryResults[0].products.count;

            let updates = new Array(queryResults[0].products.results.length);

            // Update keys
            if (count > 0) {

                for (let i = 0; i < queryResults[0].products.results.length; i++) {

                    // TODO: For now I am not implementing the key updater if the number of Variants differs between current and staged
                    if (queryResults[0].products.results[i].masterData.current.variants.length === queryResults[0].products.results[i].masterData.current.variants.length) {

                        for (let ii = 0; ii < queryResults[0].products.results[i].masterData.current.variants.length; ii++) {
                            let newVariantKey = queryResults[0].products.results[i].masterData.current.variants[ii].key === null ? queryResults[0].products.results[i].masterData.staged.variants[ii].key : queryResults[0].products.results[i].masterData.current.variants[ii].key;

                            if (newVariantKey === null) {
                                newVariantKey = queryResults[0].products.results[i].masterData.current.variants[ii].sku === null ? queryResults[0].products.results[i].masterData.staged.variants[ii].sku : queryResults[0].products.results[i].masterData.current.variants[ii].sku;
                                if (newVariantKey === null) {
                                    newVariantKey = `products_${queryResults[0].products.results[i].id}_variants_${queryResults[0].products.results[i].masterData.current.variants[ii].id}`;
                                }

                                updates[i] += ` { setProductVariantKey: { variantId: ${queryResults[0].products.results[i].masterData.current.variants[ii].id}, key: "${newVariantKey}" staged: false } }`
                            }
                        }
                    }
                    else {
                        console.log(`Product: ${queryResults[0].products.results[i].id}. The number of Variants differs between current and staged projections. You must update their keys manually.`)
                    }
                }

                const updateCalls = queryResults[0].products.results.map((result, index) => ({
                    url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                    options: {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${bearerToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            query: `mutation { updateProduct(id: "${result.id}", version: ${result.version}, actions: [${updates[index]}]) { id }}`
                        })
                    }
                }));

                await makeAPIRequests(updateCalls);
            }
        }
        catch (error) {
            throw new Error(`❌  An error occurred:\n ${error}`);
        }
    } while (count > 0)

    console.log("Finished applying Keys to other Variants.")
}

async function applyProductPriceKeys() {

    console.log("Updating Product Variant Price keys...")

    // Controls the do/while loop
    let count = 500;

    // Master Variant updates
    do {
        try {

            // Get all products that have a "null" Price key within the MasterVariant's Prices
            const queryResults = await makeAPIRequests([{
                url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                options: {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${bearerToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: `{ products(limit: 500, where: "masterData(current(masterVariant(prices is not empty and prices(key is not defined))))") { count results { id version key masterData { current { masterVariant { prices{ id key } } } staged { masterVariant { prices{ id key } } } } } }}`
                    })
                }
            }])

            // Update the counter            
            count = queryResults[0].products.count;

            // Create updates array
            let updates = new Array(queryResults[0].products.results.length);

            // Update keys
            if (count > 0) {

                // Loop through products
                for (let i = 0; i < queryResults[0].products.results.length; i++) {

                    updates[i] = "";
                    if (queryResults[0].products.results[i].masterData.current.masterVariant.prices.length > 0) {

                        // Only update the price keys if they're identical
                        if (queryResults[0].products.results[i].masterData.current.masterVariant.prices.length === queryResults[0].products.results[i].masterData.staged.masterVariant.prices.length) {

                            for (let ii = 0; ii < queryResults[0].products.results[i].masterData.current.masterVariant.prices.length; ii++) {

                                // Get index of the same price in staged
                                let indexOfStagedPrice = getArrayIndex(queryResults[0].products.results[i].masterData.staged.masterVariant.prices, queryResults[0].products.results[i].masterData.current.masterVariant.prices[ii].id);

                                if (indexOfStagedPrice === -1) {
                                    throw new Error("Unable to find matching Price in staged.");
                                }

                                let newMasterPriceKey = queryResults[0].products.results[i].masterData.current.masterVariant.prices[ii].key;

                                if (newMasterPriceKey === null) {
                                    newMasterPriceKey = queryResults[0].products.results[i].masterData.staged.masterVariant.prices[indexOfStagedPrice].key;
                                }

                                if (newMasterPriceKey === null) {
                                    newMasterPriceKey = `products_${queryResults[0].products.results[i].id}_prices_${queryResults[0].products.results[i].masterData.current.masterVariant.prices[ii].id}`;
                                }

                                updates[i] += ` { setPriceKey: { priceId: "${queryResults[0].products.results[i].masterData.current.masterVariant.prices[ii].id}", key: "${newMasterPriceKey}" staged: false } }`
                            }
                        }
                    }
                    else {
                        console.log(`Product: ${queryResults[0].products.results[i].id}. The number of Master Variant Prices differs between current and staged projections. You must update their Price keys manually.`)
                    }
                }

                const updateCalls = queryResults[0].products.results.map((result, index) => ({
                    url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                    options: {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${bearerToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            query: `mutation { updateProduct(id: "${result.id}", version: ${result.version}, actions: [${updates[index]}]) { id }}`
                        })
                    }
                }));

                await makeAPIRequests(updateCalls);
            }
        }
        catch (error) {
            throw new Error(`❌  An error occurred:\n ${error}`);
        }
    } while (count > 0)

    console.log("Finished applying Keys to Master Variant Prices.")

    // Other variant updates

    // Reset counter and updates array
    count = 500;

    // Variant updates
    do {
        try {

            // Get all products that have a "null" Price key within the Variants' Prices
            const queryResults = await makeAPIRequests([{
                url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                options: {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${bearerToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: `{  products(limit: 500, where: "masterData(current(variants(prices is not empty and prices(key is not defined))))") { count results { id version key masterData { current { variants { prices { id key} } } staged  {variants { prices { id key } } } } }  }}`
                    })
                }
            }])

            // Update the counter            
            count = queryResults[0].products.count;

            // Create updates array
            let updates = new Array(queryResults[0].products.results.length);

            // Update keys
            if (count > 0) {

                // Loop through products
                for (let i = 0; i < queryResults[0].products.results.length; i++) {

                    updates[i] = "";

                    for (let v = 0; v < queryResults[0].products.results[i].masterData.current.variants.length; v++) {

                        if (queryResults[0].products.results[i].masterData.current.variants[v].prices.length > 0) {
                            // Only update the price keys if they're identical
                            if (queryResults[0].products.results[i].masterData.current.variants[v].prices.length === queryResults[0].products.results[i].masterData.staged.variants[v].prices.length) {

                                for (let ii = 0; ii < queryResults[0].products.results[i].masterData.current.variants[v].prices.length; ii++) {

                                    // Get index of the same price in staged
                                    let indexOfStagedPrice = getArrayIndex(queryResults[0].products.results[i].masterData.staged.variants[v].prices, queryResults[0].products.results[i].masterData.current.variants[v].prices[ii].id);



                                    if (indexOfStagedPrice === -1) {
                                        throw new Error("Unable to find matching Price in staged.");
                                    }

                                    let newPriceKey = queryResults[0].products.results[i].masterData.current.variants[v].prices[ii].key;

                                    if (newPriceKey === null) {
                                        newPriceKey = queryResults[0].products.results[i].masterData.staged.variants[v].prices[indexOfStagedPrice].key;
                                    }

                                    if (newPriceKey === null) {
                                        newPriceKey = `products_${queryResults[0].products.results[i].id}_prices_${queryResults[0].products.results[i].masterData.current.variants[v].prices[ii].id}`;
                                    }

                                    updates[i] += ` { setPriceKey: { priceId: "${queryResults[0].products.results[i].masterData.current.variants[v].prices[ii].id}", key: "${newPriceKey}" staged: false } }`
                                }
                            }
                        }
                        else {
                            console.log(`Product: ${queryResults[0].products.results[i].id}. The number of Variant Prices differs between current and staged projections. You must update their Price keys manually.`)
                        }
                    }
                }

                const updateCalls = queryResults[0].products.results.map((result, index) => ({
                    url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                    options: {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${bearerToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            query: `mutation { updateProduct(id: "${result.id}", version: ${result.version}, actions: [${updates[index]}]) { id }}`
                        })
                    }
                }));

                await makeAPIRequests(updateCalls);
            }
        }
        catch (error) {
            throw new Error(`❌  An error occurred:\n ${error}`);
        }
    } while (count > 0)

    console.log("Finished applying keys to Prices in other Variants.")
}


async function applyProductAssetKeys() {

    console.log("Updating Product Variant Asset keys...")

    // Controls the do/while loop
    let count = 500;

    // Master Variant updates
    do {
        try {

            // Get all products that have a "null" Asset key within the MasterVariant's Assets
            const queryResults = await makeAPIRequests([{
                url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                options: {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${bearerToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: `{  products(limit: 500, where: "masterData(current(masterVariant(assets is not empty and assets(key is not defined))))") { count results { id version key masterData { current { masterVariant { id assets{ id key } } } staged {   masterVariant { id assets{ id key } } } } }  }}`
                    })
                }
            }])

            // Update the counter            
            count = queryResults[0].products.count;



            // Create updates array
            let updates = new Array(queryResults[0].products.results.length);

            // Update keys
            if (count > 0) {

                // Loop through products
                for (let i = 0; i < queryResults[0].products.results.length; i++) {

                    updates[i] = "";

                    if (queryResults[0].products.results[i].masterData.current.masterVariant.assets.length > 0) {
                        // Only update the Asset keys if they're identical
                        if (queryResults[0].products.results[i].masterData.current.masterVariant.assets.length === queryResults[0].products.results[i].masterData.staged.masterVariant.assets.length) {

                            for (let ii = 0; ii < queryResults[0].products.results[i].masterData.current.masterVariant.assets.length; ii++) {

                                // Get index of the same Asset in staged
                                let indexOfStagedAsset = getArrayIndex(queryResults[0].products.results[i].masterData.staged.masterVariant.assets, queryResults[0].products.results[i].masterData.current.masterVariant.assets[ii].id);

                                if (indexOfStagedAsset === -1) {
                                    throw new Error("Unable to find matching Asset in staged.");
                                }

                                let newMasterAssetKey = queryResults[0].products.results[i].masterData.current.masterVariant.assets[ii].key;

                                if (newMasterAssetKey === null) {
                                    newMasterAssetKey = queryResults[0].products.results[i].masterData.staged.masterVariant.assets[indexOfStagedAsset].key;
                                }

                                if (newMasterAssetKey === null) {
                                    newMasterAssetKey = `products_${queryResults[0].products.results[i].id}_assets_${queryResults[0].products.results[i].masterData.current.masterVariant.assets[ii].id}`;
                                }

                                updates[i] += ` { setAssetKey: { assetId: "${queryResults[0].products.results[i].masterData.current.masterVariant.assets[ii].id}", assetKey: "${newMasterAssetKey}", variantId: ${queryResults[0].products.results[i].masterData.current.masterVariant.id}, staged: false } }`
                            }
                        }
                    }
                    else {
                        console.log(`Product: ${queryResults[0].products.results[i].id}. The number of Master Variant Assets differs between current and staged projections. You must update their Asset keys manually.`)
                    }
                }

                const updateCalls = queryResults[0].products.results.map((result, index) => ({
                    url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                    options: {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${bearerToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            query: `mutation { updateProduct(id: "${result.id}", version: ${result.version}, actions: [${updates[index]}]) { id }}`
                        })
                    }
                }));

                await makeAPIRequests(updateCalls);
            }
        }
        catch (error) {
            throw new Error(`❌  An error occurred:\n ${error}`);
        }
    } while (count > 0)

    console.log("Finished applying Keys to Master Variants.")

    // Other variant updates

    // Reset counter and updates array
    count = 500;

    // Variant updates
    do {
        try {

            // Get all products that have a "null" Asset key within the Variants' Assets
            const queryResults = await makeAPIRequests([{
                url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                options: {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${bearerToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: `{  products(limit: 500, where: "masterData(current(variants(assets is not empty and assets(key is not defined))))") { count results { id version key masterData { current { variants { id assets{ id key } } } staged { variants { id assets{ id key } } } } }  }}`
                    })
                }
            }])

            // Update the counter            
            count = queryResults[0].products.count;

            // Create updates array
            let updates = new Array(queryResults[0].products.results.length);

            // Update keys
            if (count > 0) {

                // Loop through products
                for (let i = 0; i < queryResults[0].products.results.length; i++) {

                    updates[i] = "";

                    for (let v = 0; v < queryResults[0].products.results[i].masterData.current.variants.length; v++) {

                        if (queryResults[0].products.results[i].masterData.current.variants[v].assets.length > 0) {
                            // Only update the price keys if they're identical
                            if (queryResults[0].products.results[i].masterData.current.variants[v].assets.length === queryResults[0].products.results[i].masterData.staged.variants[v].assets.length) {

                                for (let ii = 0; ii < queryResults[0].products.results[i].masterData.current.variants[v].assets.length; ii++) {

                                    // Get index of the same price in staged
                                    let indexOfStagedAsset = getArrayIndex(queryResults[0].products.results[i].masterData.staged.variants[v].assets, queryResults[0].products.results[i].masterData.current.variants[v].assets[ii].id);



                                    if (indexOfStagedAsset === -1) {
                                        throw new Error("Unable to find matching Asset in staged.");
                                    }

                                    let newAssetKey = queryResults[0].products.results[i].masterData.current.variants[v].assets[ii].key;

                                    if (newAssetKey === null) {
                                        newAssetKey = queryResults[0].products.results[i].masterData.staged.variants[v].assets[indexOfStagedAsset].key;
                                    }

                                    if (newAssetKey === null) {
                                        newAssetKey = `products_${queryResults[0].products.results[i].id}_assets_${queryResults[0].products.results[i].masterData.current.variants[v].assets[ii].id}`;
                                    }

                                    updates[i] += ` { setAssetKey: { assetId: "${queryResults[0].products.results[i].masterData.current.variants[v].assets[ii].id}", assetKey: "${newAssetKey}", variantId: ${queryResults[0].products.results[i].masterData.current.variants[v].id},  staged: false } }`
                                }

                            }
                            else {
                                console.log(`Product: ${queryResults[0].products.results[i].id}. The number of Variant Assets differs between current and staged projections. You must update their Asset keys manually.`)
                            }
                        }
                    }
                }

                const updateCalls = queryResults[0].products.results.map((result, index) => ({
                    url: `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
                    options: {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${bearerToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            query: `mutation { updateProduct(id: "${result.id}", version: ${result.version}, actions: [${updates[index]}]) { id }}`
                        })
                    }
                }));
                await makeAPIRequests(updateCalls);
            }
        }
        catch (error) {
            throw new Error(`❌  An error occurred:\n ${error}`);
        }
    } while (count > 0)

    console.log("Finished applying keys to Assets in other Variants.")
}
