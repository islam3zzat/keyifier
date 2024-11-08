import inquirer from "inquirer";
import { promptChoicesMap, PromptOption } from "./prompt-choices.js";
import { logger } from "./lib/log.js";

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
        logger.info("No valid action selected.", { destination: "console" });
        return;
      }

      await userSelection.action();
    } catch (error: any) {
      handleUserExit(error);

      logger.error(error, { destination: "console" });
    }
  }

  async handleAction(action: string) {
    const promptChoices = promptChoicesMap[action];

    if (!promptChoices) {
      logger.info("No valid action selected.", { destination: "console" });

      return;
    }
    await this.handleUserSelection(promptChoices);
  }
}

function handleUserExit(error: any) {
  if (error.name !== "ExitPromptError") {
    return;
  }

  logger.info("nExiting...", { destination: "console" });

  process.exit(0);
}
