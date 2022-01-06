import { drawChart } from "./../types/chats/index";
import { scan, throttle } from "rxjs/operators";
import UpdateTypesStatistics from "../wikiUpdateTypes/UpdateTypesStatistics";
import MostActiveUserStatistics from "../wikiMostActiveUser/MostActiveUserStatistics";
import { MostActiveUserStatisticsType } from "../wikiMostActiveUser/MostActiveUserStatisticsType";
import { interval, Observable, Subscription } from "rxjs";
import "../wikiSubscriber";

const GetUpdateStatisticsSubscription = () => {
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
}

const GetUpdateStatisticsSubscriber = (logFunction: CallableFunction) => {
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
  }
}

const GetMostActiveUserSubscription = () => {
  return MostActiveUserStatistics.pipe(
    throttle(() => interval(10000))
  );
}

const GetMostActiveUserSubscriber = (logFunction: CallableFunction) => {
  return (data: MostActiveUserStatisticsType) => {
    console.clear();
    process.stdout.write("\n");

    logFunction(

    );
  }
}

declare type subscriberFunctionType = (logFunction: CallableFunction) => (data: any) => void
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
  currentOperation:
    | "user_selection"
    | "interval_selection"
    | "mode_selection"
    | "stats_selection"
    | "" = "";
  currentInterval: "1m" | "30s" | "10s" = "10s";
  currentMode: "text" | "graph" = "graph";
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
    | Observable<MostActiveUserStatisticsType>
    | undefined = undefined;
  currentSubscription: Subscription | undefined = undefined;
  constructor() {
    this.logWithUserPrompt("");
    process.stdin.setRawMode(true);
    process.stdin.addListener("data", this.rootStdInListener.bind(this));

    this.currentObservable = GetUpdateStatisticsSubscription();
    this.currentSubscription = this.currentObservable.subscribe(
      this.defaultSubscriber.bind(this)
    );
  }

  defaultSubscriber: subscriberFunctionType = GetUpdateStatisticsSubscriber(this.logWithUserPrompt);

  actionsListener(data: Buffer) {
    this.currentSubscription?.unsubscribe();
    const userInput = data.toString()[0];
    switch (userInput) {
      case "u":
        this.promptUsersList();
        break;
      case "i":
        this.logWithUserPrompt("ahaha\n");
        break;
      case "m":
        this.promptModeList();
        break;
      case "s":
        this.logWithUserPrompt("ssssssssss\n");
        break;
      default:
        this.logWithUserPrompt("");
        break;
    }
  }

  promptUsersList() {
    process.stdin.setRawMode(false);
    console.clear();
    this.currentOperation = "user_selection";
    process.stdout.write("Enter coma separated users filter list: ");
  }

  promptModeList() {
    console.clear();
    this.currentOperation = "mode_selection";
    process.stdout.write(
      Object.entries(this.modeSelectionActions)
        .map((entry) => entry[0] + " " + entry[1])
        .join("\n")
    );
    process.stdout.write("\nSelect number for a mode: ");
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
      return;
    }
    console.clear();
    this.promptModeList();
  }

  intervalSelected(data: Buffer) {
    process.stdin.setRawMode(true);

    const selection = data.toString()[0];
    if (selection == "1" || selection == "2" || selection == "3") {
      this.currentOperation = "";
      this.currentInterval = selection === "1" ? "1m" : selection === "2" ? "30s" : "10s";
      this.rootStdInListener(Buffer.from(""));
      return;
    }

    this.currentObservable = GetMostActiveUserSubscription();
    this.defaultSubscriber = GetMostActiveUserSubscriber(this.logWithUserPrompt);
    this.currentSubscription = this.currentObservable?.subscribe(
      this.defaultSubscriber.bind(this)
    );
  }

  usersSelected(data: Buffer) {
    process.stdin.setRawMode(true);

    this.currentOperation = "";
    this.usersList = data
      .toString()
      .split(",")
      .map((s) => s.trim());
    this.rootStdInListener(Buffer.from(""));

    this.currentObservable = GetUpdateStatisticsSubscription();
    this.defaultSubscriber = GetUpdateStatisticsSubscriber(this.logWithUserPrompt);
    this.currentSubscription = this.currentObservable?.subscribe(
      this.defaultSubscriber.bind(this)
    );
  }

}

const instance = new CLIConsumer();
