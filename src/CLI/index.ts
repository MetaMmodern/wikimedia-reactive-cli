import chalk from "chalk";
import { drawChart } from "./../types/chats/index";
import { map, scan, throttle } from "rxjs/operators";
import UpdateTypesStatistics from "../wikiUpdateTypes/UpdateTypesStatistics";
import MostActiveUserStatistics from "../wikiMostActiveUser/MostActiveUserStatistics";
import { MostActiveUserStatisticsType } from "../wikiMostActiveUser/MostActiveUserStatisticsType";
import { interval, Observable, Subscription } from "rxjs";
import "../wikiSubscriber";

// 4 messages edit new log categorize (text/mode)
const UpdateStatisticsObservable = () => {
  return UpdateTypesStatistics.pipe(
    scan(
      (acc, cur) => {
        return {
          new: [...acc.new, cur.new],
          edit: [...acc.edit, cur.edit],
          log: [...acc.log, cur.log],
          categorize: [...acc.categorize, cur.categorize],
        };
      },
      { new: [], log: [], edit: [], categorize: [] } as {
        new: number[];
        log: number[];
        edit: number[];
        categorize: number[];
      }
    ),
    throttle(() => interval(500))
    // concatMap((item) => of(item).pipe(delay(100)))
  );
};

const UpdateStatisticsGraphicSubscriber = (logFunction: Function) => {
  return (data: {
    new: number[];
    log: number[];
    edit: number[];
    categorize: number[];
  }) => {
    console.clear();
    process.stdout.write("\n");

    logFunction(
      drawChart([data.edit, data.log, data.categorize, data.new], {
        height: process.stdout.rows - 2,
        colorsNames: ["yellow", "magenta", "blue", "red"],
      })
    );
  };
};
const UpdateStatisticsTextSubscriber = (logFunction: Function) => {
  return (data: {
    new: number;
    log: number;
    edit: number;
    categorize: number;
  }) => {
    console.clear();
    process.stdout.write("\n");

    logFunction(chalk.bgGreen(JSON.stringify(data, null, 2)));
  };
};

// (list: time, user, contributions)
const GetMostActiveUserSubscription = () => {
  return MostActiveUserStatistics.pipe(throttle(() => interval(10000)));
};

const GetMostActiveUserSubscriber = (logFunction: Function) => {
  return (data: MostActiveUserStatisticsType) => {
    console.clear();
    process.stdout.write("\n");

    logFunction();
  };
};

class CLIConsumer {
  readonly baseActions = {
    "[u]": "users",
    "[i]": "interval",
    "[m]": "mode",
    "[s]": "stats",
    "[q]": "quit",
  };
  readonly modeSelectionActions = {
    "[1]": "Text",
    "[2]": "Graph",
  };
  readonly intervalSelectionActions = {
    "[1]": "10 seconds",
    "[2]": "30 seconds",
    "[3]": "1 minute",
  };
  readonly stateSelectionActions = {
    "[1]": "10 seconds",
    "[2]": "30 seconds",
    "[3]": "1 minute",
  };
  currentOperation:
    | "user_selection"
    | "interval_selection"
    | "mode_selection"
    | "stats_selection"
    | "" = "";
  currentInterval: "1m" | "30s" | "10s" = "10s";
  currentMode: "text" | "graph" = "graph";
  currentState:
    | "most_active_users"
    | "most_typoed_articles"
    | "edit_types_statistics" = "edit_types_statistics";
  usersList: string[] = [];
  showsStats: boolean = false;
  statsType: string = "";
  currentObservable:
    | Observable<{
        new: number[];
        log: number[];
        edit: number[];
        categorize: number[];
      }>
    | Observable<MostActiveUserStatisticsType>;
  currentSubscription: Subscription;
  constructor() {
    this.logWithUserPrompt("");
    process.stdin.setRawMode(true);
    process.stdin.addListener("data", this.rootStdInListener.bind(this));

    this.currentObservable = UpdateStatisticsObservable();
    this.currentSubscription = this.currentObservable.subscribe(
      this.currentSubscriber.bind(this)
    );
  }

  rxResolver() {
    if (this.currentOperation !== "") {
      this.currentSubscription.unsubscribe();
      return;
    }
    switch (this.currentState) {
      case "edit_types_statistics":
        if (this.currentMode === "graph") {
          this.currentObservable = UpdateStatisticsObservable();
          this.currentSubscription = this.currentObservable?.subscribe(
            UpdateStatisticsGraphicSubscriber(
              this.logWithUserPrompt.bind(this)
            ).bind(this)
          );
        } else {
          this.currentObservable = UpdateStatisticsObservable();
          this.currentSubscription = this.currentObservable
            .pipe(
              map(
                (v) =>
                  Object.fromEntries(
                    Object.entries(v).map((e) => [
                      e[0],
                      e[1].reduce((acc, curr) => acc + curr, 0),
                    ])
                  ) as {
                    new: number;
                    log: number;
                    edit: number;
                    categorize: number;
                  }
              )
            )
            .subscribe(
              UpdateStatisticsTextSubscriber(this.logWithUserPrompt.bind(this))
            );
        }
        break;
      case "most_active_users":
        break;
      case "most_typoed_articles":
        break;
      default:
        break;
    }
  }

  currentSubscriber: Function = UpdateStatisticsGraphicSubscriber(
    this.logWithUserPrompt.bind(this)
  );

  actionsListener(data: Buffer) {
    const userInput = data.toString()[0];
    switch (userInput) {
      case "u":
        this.promptUsersList();
        break;
      case "i":
        this.promptIntervalList();
        break;
      case "m":
        this.promptModeList();
        break;
      case "s":
        this.currentSubscription?.unsubscribe();
        this.promptState();
        break;
      case "q":
        process.exit(0);
      default:
        // this.logWithUserPrompt("");
        break;
    }
  }

  promptUsersList() {
    process.stdin.setRawMode(false);
    console.clear();
    this.currentOperation = "user_selection";
    this.rxResolver();
    process.stdout.write("Enter coma separated users filter list: ");
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
        .map((entry) => entry[0] + " " + entry[1])
        .join("\n")
    );
    process.stdout.write("\nSelect number for an interval: ");
  }
  promptState() {
    this.currentOperation = "stats_selection";
    this.rxResolver();
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
    if (selection == "1" || selection == "2" || selection == "3") {
      this.currentOperation = "";
      this.currentInterval =
        selection === "1" ? "1m" : selection === "2" ? "30s" : "10s";
      this.rootStdInListener(Buffer.from(""));
      this.currentObservable = GetMostActiveUserSubscription();
      this.currentSubscriber = GetMostActiveUserSubscriber(
        this.logWithUserPrompt.bind(this)
      );
      this.currentSubscription = this.currentObservable?.subscribe(
        this.currentSubscriber.bind(this)
      );
      return;
    }
    // console.clear();
    else this.promptIntervalList();
  }

  usersSelected(data: Buffer) {
    process.stdin.setRawMode(true);

    this.currentOperation = "";
    this.usersList = data
      .toString()
      .split(",")
      .map((s) => s.trim());
    this.rootStdInListener(Buffer.from(""));
    this.rxResolver();
  }
}

const instance = new CLIConsumer();
