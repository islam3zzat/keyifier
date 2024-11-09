import yargs from "yargs";
import { configureCLI } from "./cli.js";
import { Prompter } from "./prompter.js";
import { consoleLogger } from "./lib/log.js";

async function main() {
  console.clear();

  const argv = await configureCLI();

  if (argv.help) {
    yargs.showHelp();
    return;
  }

  const prompter = new Prompter();

  try {
    await getUserAction(prompter, argv);
  } catch (error: any) {
    consoleLogger.error(error);
  }
}

// Function to get the user action (either from CLI or interactively)
async function getUserAction(prompter: Prompter, argv: any) {
  // If action is provided via command line, use it
  if (argv.action) {
    return argv.action;
  }

  // If no action is provided, prompt the user interactively
  return await prompter.getUserAction();
}

main();
