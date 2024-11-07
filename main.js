import { configureCLI } from "./cli.js";
import { Prompter } from "./prompter.js";

async function main() {
  console.clear();

  const argv = configureCLI();

  if (argv.help) {
    yargs.showHelp();
    return;
  }

  const prompter = new Prompter();

  try {
    const rootAction = await getUserAction(prompter, argv);

    await prompter.handleAction(rootAction);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Function to get the user action (either from CLI or interactively)
async function getUserAction(prompter, argv) {
  // If action is provided via command line, use it
  if (argv.action) {
    return argv.action;
  }

  // If no action is provided, prompt the user interactively
  return await prompter.getUserAction();
}

main();
