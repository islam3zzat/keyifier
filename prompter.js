import inquirer from "inquirer";
import {
  applyProductKeys,
  applyProductVariantKeys,
  applyProductPriceKeys,
  applyProductAssetKeys,
} from "./queryProductKeys.js";
import { endpoints, returnSentenceCasedString } from "./queryKeys.js";
import { resourceTypes, applyCategoryKeys } from "./queryCategoryKeys.js";

export class Prompter {
  constructor() {
    this.actionCallbacks = {
      productKeys: this.handleProductKeys.bind(this),
      otherKeys: this.handleQueryKeys.bind(this),
      categoryKeys: this.handleQueryCategoryKeys.bind(this),
    };
  }

  async getUserAction() {
    const { rootActionPrompt } = await inquirer.prompt([
      {
        type: "list",
        name: "rootActionPrompt",
        message: "Select the main action to perform:",
        choices: [
          { name: "Apply Keys to Product Resources", value: "productKeys" },
          { name: "Query Category Keys", value: "categoryKeys" },
          { name: "Query Resource Keys", value: "otherKeys" },
        ],
      },
    ]);
    return rootActionPrompt;
  }

  async promptForResourceSelection(keysNeededForTheseResources) {
    const updateAnswers = await inquirer.prompt([
      {
        type: keysNeededForTheseResources.length === 1 ? "list" : "checkbox",
        name: "resourcesToUpdate",
        message: "Select the resources to apply keys to:",
        choices: keysNeededForTheseResources.map(
          (index) => resourceTypes[index]
        ),
      },
    ]);

    return Array.isArray(updateAnswers.resourcesToUpdate)
      ? updateAnswers.resourcesToUpdate.map((choice) =>
          resourceTypes.indexOf(choice)
        )
      : [resourceTypes.indexOf(updateAnswers.resourcesToUpdate)];
  }

  async handleProductKeys() {
    try {
      const { selectAction } = await inquirer.prompt([
        {
          type: "list",
          name: "selectAction",
          message: "Select the product resource action to perform:",
          choices: [
            "Apply keys to Products",
            "Apply keys to Product Variants",
            "Apply keys to Product Prices",
            "Apply keys to Product Assets",
          ],
        },
      ]);

      switch (selectAction) {
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
          console.log("No valid product action selected.");
      }
    } catch (error) {
      handleUserExit(error);

      console.error("Error:", error);
    }
  }

  async handleQueryKeys() {
    try {
      const { selectedEndpoints } = await inquirer.prompt([
        {
          type: "checkbox",
          name: "selectedEndpoints",
          message: "Select the resource types to query:",
          choices: endpoints.map(returnSentenceCasedString),
        },
      ]);
      console.log("Querying selected endpoints:", selectedEndpoints);
    } catch (error) {
      handleUserExit(error);

      console.error("Error:", error);
    }
  }

  async handleQueryCategoryKeys() {
    try {
      const { selectedResource } = await inquirer.prompt([
        {
          type: "checkbox",
          name: "selectedResource",
          message: "Select the resource types to query:",
          choices: resourceTypes,
        },
      ]);
      console.log("Querying selected resources:", selectedResource);
      await applyCategoryKeys(selectedResource);
    } catch (error) {
      handleUserExit(error);

      console.error("Error:", error);
    }
  }

  async handleAction(action) {
    const actionCallback = this.actionCallbacks[action];
    if (actionCallback) {
      await actionCallback();
    } else {
      console.log("No valid action selected.");
    }
  }
}

function handleUserExit(error) {
  if (error.name !== "ExitPromptError") {
    return;
  }

  console.log("\n\nExiting...");
  process.exit(0);
}
