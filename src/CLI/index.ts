#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
  .command(
    "show-activity",
    "Logs all recent changes",
    (y) =>
      y.options({
        user: {
          alias: "u",
          type: "array",
          description:
            "Specify the user(or users) whose actions will be logged. Defaults to empty.",
          string: true,
          default: [],
        },
        mode: {
          alias: "m",
          type: "string",
          description: "Mode of the logs.",
          choices: ["graph", "text", "image"],
          default: "text",
        },
        interval: {
          type: "string",
          description: "Sets the interval for graph only",
          choices: ["none", "1s", "5s", "10s", "1m"],
          default: "none",
        },
      }),
    (activityHandler) => {
      activityHandler.user;
    }
  )
  .command(
    "stats",
    "Shows statistics for a certain user",
    (y) =>
      y.options({
        user: {
          alias: "u",
          type: "array",
          description:
            "Specify the user(or users) whose actions will be logged. Defaults to empty.",
          string: true,
          demandOption: true,
        },
      }),
    (statsHander) => {
      statsHander.user;
    }
  )
  .demandCommand(1)
  .parse();
