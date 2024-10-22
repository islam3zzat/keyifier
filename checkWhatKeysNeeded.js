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

const endpoints = [
    "cartDiscounts",
    "categories",
    "customerGroups",
    "discountCodes",
    "inventory",
    "products",
    "productTypes",
    "taxCategories",
];

async function queryEndpoint(endpoint) {

    const bearerToken = await getBearerToken();
    try {

        const response = await fetch(
            `${CTP_API_URL}/${CTP_PROJECT_KEY}/graphql`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json'

                },
                body: JSON.stringify({
                    query: `query{ ${endpoint}(limit:500, where:"key is not defined"){ results{ id }  }}`
                })
            });

        const data = await response.json();
        return data.data[endpoint].results.map(result => result.id);

    } catch (error) {
        console.error('❌ Error querying endpoint: ', error);
    }
}

const answers = await inquirer.prompt([
    {
        type: 'list',
        name: 'selectedEndpoint',
        message: 'Select an endpoint:',
        choices: endpoints
    }
])

let followUp = false;
let results = [];

try {
    console.log(`You selected: ${answers.selectedEndpoint}`);
    results = await queryEndpoint(answers.selectedEndpoint)

    if (results.length >= 500) {
        console.log(`At least 500 ${answers.selectedEndpoint} require keys.`)
    }
    else {

        if (results.length === 0) {
            console.log(`0 ${answers.selectedEndpoint} require keys.`)
        }
        else {
            console.log(`${results.length} ${answers.selectedEndpoint} require keys.`)
            followUp = true;
        }
    }
}
catch (error) {
    console.error('An error occurred:', error);
}

if (followUp) {
    const outputRequired = await inquirer.prompt([
        {
            type: 'list',
            name: 'outputIds',
            message: `Output ids of ${answers.selectedEndpoint} requiring keys?`,
            choices: ["Yes", "No"]
        }
    ])

    if (outputRequired.outputIds === "Yes") {
        results.forEach(result => {
            console.log(result)
        });
    }
}