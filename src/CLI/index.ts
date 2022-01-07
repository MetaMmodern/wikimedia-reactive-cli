import { Observable, Subscription } from "rxjs";
import chalk from "chalk";

import {
  UpdateStatisticsGraphObservable,
  UpdateStatisticsTextObservable,
  MostActiveUsersObservable,
  MostTypoedArticlesObservable,
  UserContributionsOverTimeObservable,
  UserContributionsStatisticsObservable,
} from "./CLIObbservables";

class CLIConsumer {
  readonly baseActions = {
    "[u]": "users",
    "[i]": "interval",
    "[m]": "mode",
    "[s]": "state",
    "[q]": "quit",
  };
  readonly modeSelectionActions = {
    "[1]": "Text",
    "[2]": "Graph",
  };
  readonly intervalSelectionActions = {
    "[1]": "1 second",
    "[2]": "10 seconds",
    "[3]": "30 seconds",
    "[4]": "1 minute",
  };
  readonly stateSelectionActions = {
    "[1]": "Show Edit Statistics",
    "[2]": "Top active users",
    "[3]": "Most typoed articles",
    "[4]": "User contributions over time",
    "[5]": "User contributions statistics",
  };
  currentOperation:
    | "user_selection"
    | "interval_selection"
    | "mode_selection"
    | "stats_selection"
    | "" = "";
  currentInterval: "sec_1" | "sec_10" | "sec_30" | "min" = "sec_10";
  GetIntervalValue = () => {
    return this.currentInterval == "sec_1"
      ? 1000
      : this.currentInterval == "sec_10"
      ? 10000
      : this.currentInterval == "sec_30"
      ? 30000
      : 60000;
  };
  currentMode: "text" | "graph" = "graph";
  currentState:
    | "user_contributions_statistics"
    | "user_contributions_over_time"
    | "most_active_users"
    | "most_typoed_articles"
    | "edit_types_statistics" = "edit_types_statistics";
  currentUser: string = "";
  showsStats: boolean = false;
  statsType: string = "";
  currentObservable: Observable<string>;
  currentSubscription: Subscription;
  constructor() {
    this.logWithUserPrompt("");
    process.stdin.setRawMode(true);
    process.stdin.addListener("data", this.rootStdInListener.bind(this));

    this.currentObservable = UpdateStatisticsGraphObservable();
    this.currentSubscription = this.currentObservable.subscribe(
      this.logWithUserPrompt.bind(this)
    );
  }

  async rxResolver() {
    if (this.currentOperation !== "") {
      this.currentSubscription.unsubscribe();
      return;
    }
    switch (this.currentState) {
      case "edit_types_statistics":
        if (this.currentMode === "graph") {
          this.currentObservable = UpdateStatisticsGraphObservable();
        } else {
          this.currentObservable = UpdateStatisticsTextObservable();
        }
        break;
      case "most_active_users":
        this.currentObservable = MostActiveUsersObservable(
          this.currentInterval
        );
        break;
      case "most_typoed_articles":
        this.currentObservable = MostTypoedArticlesObservable();
        break;
      case "user_contributions_over_time":
        if (this.currentUser == "") {
          console.log(chalk.redBright("\nSpecify the user first."));
          await new Promise((resolve) => {
            setTimeout(resolve, 2000);
          });
        } else {
          this.currentObservable = UserContributionsOverTimeObservable(
            this.currentUser,
            this.GetIntervalValue()
          );
        }
        break;
      case "user_contributions_statistics":
        if (this.currentUser == "") {
          console.log(chalk.redBright("\nSpecify the user first."));
          await new Promise((resolve) => {
            setTimeout(resolve, 2000);
          });
        } else {
          this.currentObservable = UserContributionsStatisticsObservable(
            this.currentUser
          );
        }
        break;
      default:
        break;
    }
    this.currentSubscription = this.currentObservable.subscribe(
      this.logWithUserPrompt.bind(this)
    );
  }

  actionsListener(data: Buffer) {
    const userInput = data.toString()[0];
    switch (userInput) {
      case "u":
        this.promptUser();
        break;
      case "i":
        this.promptIntervalList();
        break;
      case "m":
        this.promptModeList();
        break;
      case "s":
        this.promptState();
        break;
      case "q":
        process.exit(0);
      default:
        break;
    }
  }

  promptUser() {
    process.stdin.setRawMode(false);
    console.clear();
    this.currentOperation = "user_selection";
    this.rxResolver();
    process.stdout.write("Enter user: ");
  }

  promptModeList() {
    console.clear();
    this.currentOperation = "mode_selection";
    this.rxResolver();
    process.stdout.write(
      Object.entries(this.modeSelectionActions)
        .map((entry) => entry[0] + " " + entry[1])
        .join("\n")
    );
    process.stdout.write("\nSelect number for a mode: ");
  }

  promptIntervalList() {
    console.clear();
    this.currentOperation = "interval_selection";
    this.rxResolver();
    process.stdout.write(
      Object.entries(this.intervalSelectionActions)
        .map((entry) => `${entry[0]} ${entry[1]}`)
        .join("\n")
    );
    process.stdout.write("\nSelect number for an interval: ");
  }

  promptState() {
    console.clear();
    this.currentOperation = "stats_selection";
    this.rxResolver();
    process.stdout.write(
      Object.entries(this.stateSelectionActions)
        .map((entry) => `${entry[0]} ${entry[1]}`)
        .join("\n")
    );
    process.stdout.write("\nSelect number for an interval: ");
  }

  rootStdInListener(data: Buffer) {
    switch (this.currentOperation) {
      case "user_selection":
        this.usersSelected(data);
        break;
      case "interval_selection":
        this.intervalSelected(data);
        break;
      case "mode_selection":
        this.modeSelected(data);
        break;
      case "stats_selection":
        this.stateSelected(data);
        break;
      default:
        this.actionsListener(data);
        break;
    }
  }

  logWithUserPrompt(output: string) {
    console.clear();
    process.stdout.write(output + "\n");
    process.stdout.write(
      Object.entries(this.baseActions)
        .map((entry) => entry[0] + entry[1].slice(1))
        .join(" ") + " => "
    );
  }

  modeSelected(data: Buffer) {
    const selection = data.toString()[0];
    if (selection == "1" || selection == "2") {
      this.currentOperation = "";
      this.currentMode = selection === "1" ? "text" : "graph";
      this.rootStdInListener(Buffer.from(""));
      this.rxResolver();
      return;
    }
    console.clear();
    this.promptModeList();
  }

  intervalSelected(data: Buffer) {
    const selection = data.toString()[0];
    if (
      selection == "1" ||
      selection == "2" ||
      selection == "3" ||
      selection == "4"
    ) {
      this.currentOperation = "";
      this.currentInterval =
        selection === "1"
          ? "sec_1"
          : selection === "2"
          ? "sec_10"
          : selection === "3"
          ? "sec_30"
          : "min";
      this.rootStdInListener(Buffer.from(""));
      this.rxResolver();
      return;
    }
    // console.clear();
    else this.promptIntervalList();
  }

  usersSelected(data: Buffer) {
    process.stdin.setRawMode(true);

    this.currentOperation = "";
    this.currentUser = data.toString().trim();
    this.rootStdInListener(Buffer.from(""));
    this.rxResolver();
  }

  stateSelected(data: Buffer) {
    const selection = data.toString()[0];
    if (
      selection == "1" ||
      selection == "2" ||
      selection == "3" ||
      selection == "4" ||
      selection == "5"
    ) {
      this.currentOperation = "";
      this.currentState =
        selection == "1"
          ? "edit_types_statistics"
          : selection == "2"
          ? "most_active_users"
          : selection == "3"
          ? "most_typoed_articles"
          : selection == "4"
          ? "user_contributions_over_time"
          : "user_contributions_statistics";
      this.rootStdInListener(Buffer.from(""));
      this.rxResolver();
      return;
    }
    // console.clear();
    else this.promptState();
  }
}

const instance = new CLIConsumer();
