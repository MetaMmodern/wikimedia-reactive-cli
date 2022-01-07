import chalk from "chalk";
import { drawChart } from "./../types/chats/index";
import { map, scan, throttle } from "rxjs/operators";
import { interval, Observable, Subscription } from "rxjs";
import Table from "cli-table";
import wikiEventsEmitter from "../wikiEventsEmitter";

const UpdateStatisticsTextObservable = () => {
  return wikiEventsEmitter.GetUpdateTypesStatistics().pipe(
    scan(
      (_acc, cur) => {
        return {
          new: [cur.new],
          edit: [cur.edit],
          log: [cur.log],
          categorize: [cur.categorize],
        };
      },
      { new: [], log: [], edit: [], categorize: [] } as {
        new: number[];
        log: number[];
        edit: number[];
        categorize: number[];
      }
    ),
    throttle(() => interval(500)),
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
    ),
    map((data) => chalk.bgGreen(JSON.stringify(data, null, 2)))

    // concatMap((item) => of(item).pipe(delay(100)))
  );
};

const UpdateStatisticsGraphObservable = () => {
  return wikiEventsEmitter.GetUpdateTypesStatistics().pipe(
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
    throttle(() => interval(500)),
    map((data) => {
      const chart = drawChart(
        [data.edit, data.log, data.categorize, data.new],
        {
          height: process.stdout.rows - 3,
          colorsNames: ["yellow", "magenta", "blue", "red"],
        }
      );
      const square = "■";

      let legend = [
        chalk.red(square + "New"),
        chalk.yellow(square + "Edit"),
        chalk.magenta(square + "Log"),
        chalk.blue(square + "Categorize"),
      ].join("  ");
      const pad = " ".repeat(process.stdout.columns / 2 - legend.length / 2);
      legend = pad + legend;
      return chart + "\n" + legend;
    })
    // concatMap((item) => of(item).pipe(delay(100)))
  );
};

// (list: time, user, contributions)
const MostActiveUsersObservable = (inteval: "min" | "sec_30" | "sec_10" | "sec_1") => {
  return wikiEventsEmitter.GetMostActiveUserStatistics().pipe(
    throttle(() => interval(1000)),
    map((v) => v[inteval]),
    map((v) => {
      const table = new Table({
        head: ["Place", "Username", "Contributions", "Timing"],
      });
      v.map((el, i) => {
        const timing =
          `${el.fromDate.getHours()}:${el.fromDate.getMinutes()}:${el.fromDate.getSeconds()}` +
          `-${el.toDate.getHours()}:${el.toDate.getMinutes()}:${el.toDate.getSeconds()}`;
        return table.push([i + 1, el.userName, el.contributions, timing]);
      });
      return table.toString();
    })
  );
};

const UserContributionsOverTimeObservable = (user: string, timeDelay: number) => {
  return wikiEventsEmitter.GetUserContributionsOverTime(user, timeDelay).pipe(
    scan(
      (acc, cur) => {
        return {
          contributions: [...acc.contributions, cur],
        };
      },
      { contributions: [] } as {
        contributions: number[];
      }
    ),
    map((data) => {
      const chart = drawChart(
        [data.contributions],
        {
          height: process.stdout.rows - 3,
          colorsNames: ["green"],
        }
      );
      const square = "■";

      let legend = chalk.green(square + "Contributions");
      const pad = " ".repeat(process.stdout.columns / 2 - legend.length / 2);
      legend = pad + legend;
      return chart + "\n" + legend;
    })
  );
};

const MostTypoedArticlesObservable = () => {
  return wikiEventsEmitter.GetTypoedArticlesStatistics().pipe(
    map((el) => {
      const totalString = `Total processed: ${chalk.cyanBright(
        el.totalSize
      )} articles.\n`;
      const topArticles = new Table({
        head: ["Name", "???Nik"],
      });
      el.values.forEach((article) =>
        topArticles.push([article[0], article[1]])
      );
      return totalString + topArticles.toString();
    })
  );
};

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
  };
  currentOperation:
    | "user_selection"
    | "interval_selection"
    | "mode_selection"
    | "stats_selection"
    | "" = "";
  currentInterval: "sec_1" | "sec_10" | "sec_30" | "min" = "sec_10";
  GetIntervalValue = () => { 
    return this.currentInterval == "sec_1" ? 1000 : this.currentInterval == "sec_10" ? 10000 : this.currentInterval == "sec_30" ? 30000 : 60000;
  }
  currentMode: "text" | "graph" = "graph";
  currentState:
    | "user_contributions_over_time"
    | "most_active_users"
    | "most_typoed_articles"
    | "edit_types_statistics" = "edit_types_statistics";
  usersList: string[] = [];
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

  rxResolver() {
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
        this.currentObservable = UserContributionsOverTimeObservable(this.usersList[0], this.GetIntervalValue());
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
        this.promptUsersList();
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
    if (selection == "1" || selection == "2" || selection == "3" || selection == "4") {
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
    this.usersList = data
      .toString()
      .split(",")
      .map((s) => s.trim());
    this.rootStdInListener(Buffer.from(""));
    this.rxResolver();
  }

  stateSelected(data: Buffer) {
    const selection = data.toString()[0];
    if (selection == "1" || selection == "2" || selection == "3" || selection == "4") {
      this.currentOperation = "";
      this.currentState =
        selection == "1"
          ? "edit_types_statistics"
          : selection == "2"
          ? "most_active_users"
          : selection == "3"
          ? "most_typoed_articles"
          : "user_contributions_over_time";
      this.rootStdInListener(Buffer.from(""));
      this.rxResolver();
      return;
    }
    // console.clear();
    else this.promptState();
  }
}

const instance = new CLIConsumer();
