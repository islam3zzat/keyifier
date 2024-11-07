import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export function configureCLI() {
  return yargs(hideBin(process.argv))
    .option("help", {
      alias: "h",
      describe: "Show help",
      type: "boolean",
    })
    .option("action", {
      alias: "a",
      describe: "Root action to perform",
      choices: ["productKeys", "categoryKeys", "otherKeys"],
      type: "string",
    }).argv;
}
