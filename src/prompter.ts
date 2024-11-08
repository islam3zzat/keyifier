import inquirer from "inquirer";
import { promptChoicesMap, PromptOption } from "./prompt-choices.js";

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
        console.log("No valid action selected.");
        return;
      }

      await userSelection.action();
    } catch (error) {
      handleUserExit(error);

      console.error("Error:", error);
    }
  }

  async handleAction(action: string) {
    const promptChoices = promptChoicesMap[action];

    if (!promptChoices) {
      console.log("No valid action selected.");
      return;
    }
    await this.handleUserSelection(promptChoices);
  }
}

function handleUserExit(error: any) {
  if (error.name !== "ExitPromptError") {
    return;
  }

  console.log("\n\nExiting...");
  process.exit(0);
}
