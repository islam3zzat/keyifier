import inquirer from "inquirer";
import { promptChoicesMap, PromptOption } from "./prompt-choices.js";
import { consoleLogger } from "./lib/log.js";

export class Prompter {
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
    await this.handleAction(rootActionPrompt);
  }

  async handleUserSelection(promptOptions: PromptOption[]) {
    try {
      const { selectAction } = await inquirer.prompt([
        {
          type: "list",
          name: "selectAction",
          message: "Select the action to perform:",
          choices: promptOptions.map((action) => action.choice),
        },
      ]);

      const userSelection = promptOptions.find(
        (action) => action.choice === selectAction
      );
      if (!userSelection) {
        consoleLogger.info("No valid action selected.");
        return;
      }

      const total = await userSelection.fetchTotal();

      await this.applyAfterConfirmation(userSelection.action, total);
    } catch (error: any) {
      handleUserExit(error);

      console.error(error);
      consoleLogger.error(error.message);
    }
  }

  async applyAfterConfirmation(callback: () => Promise<void>, total?: number) {
    if (!total) {
      consoleLogger.info("No resources without keys found.");
      return;
    }

    const message = `You're about to update ${total} resource.\nAre you sure you want to proceed?`;

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message,
      },
    ]);

    if (!confirm) {
      consoleLogger.info("User cancelled the operation.");
      return;
    }

    await callback();
  }

  async handleAction(action: string) {
    const promptChoices = promptChoicesMap[action];

    if (!promptChoices) {
      consoleLogger.info("No valid action selected.");

      return;
    }
    await this.handleUserSelection(promptChoices);
  }
}

function handleUserExit(error: any) {
  if (error.name !== "ExitPromptError") {
    return;
  }

  consoleLogger.info("nExiting...", { destination: "console" });

  process.exit(0);
}
