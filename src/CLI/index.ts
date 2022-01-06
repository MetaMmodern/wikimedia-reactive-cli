import { drawChart } from "./../types/chats/index";
import { map, scan, throttle } from "rxjs/operators";
import "../wikiSubscriber";
import UpdateTypesStatistics from "../wikiUpdateTypes/UpdateTypesStatistics";
import { concatMap, delay, interval, Observable, of, Subscription } from "rxjs";
import * as asciichart from "asciichart";

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
  readonly statsSelectionActions = {
    "[1]": "Edit",
    "[2]": "Delete",
  };
  readonly intervalSelectionActions = {};
  currentOperation:
    | "user_selection"
    | "interval_selection"
    | "mode_selection"
    | "stats_selection"
    | "" = "";
  currentInterval: "10s" | "5s" | "1s" | "" = "";
  currentMode: "text" | "graph" = "text";
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
    | undefined = undefined;
  currentSubscription: Subscription | undefined = undefined;
  constructor() {
    this.logWithUserPrompt("");
    process.stdin.setRawMode(true);
    process.stdin.addListener("data", this.rootStdInListener.bind(this));

    this.currentObservable = UpdateTypesStatistics.pipe(
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
    this.currentSubscription = this.currentObservable.subscribe(
      this.defaultSubscriber.bind(this)
    );
  }
  defaultSubscriber(data: {
    new: number[];
    log: number[];
    edit: number[];
    categorize: number[];
  }) {
    console.clear();
    process.stdout.write("\n");

    this.logWithUserPrompt(
      drawChart([data.edit, data.log, data.categorize, data.new], {
        height: process.stdout.rows - 2,
        colorsNames: ["yellow", "magenta", "blue", "red"],
      })
    );
  }
  rootStdInListener(data: Buffer) {
    switch (this.currentOperation) {
      case "user_selection":
        this.usersSelected(data);
        break;
      case "interval_selection":
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
  logWithUserPrompt(output: string) {
    console.clear();
    process.stdout.write(output + "\n");
    process.stdout.write(
      Object.entries(this.baseActions)
        .map((entry) => entry[0] + entry[1].slice(1))
        .join(" ") + " => "
    );
  }

  promptUsersList() {
    process.stdin.setRawMode(false);
    console.clear();
    this.currentOperation = "user_selection";
    process.stdout.write("Enter coma separated users filter list: ");
  }

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

  usersSelected(data: Buffer) {
    process.stdin.setRawMode(true);

    this.currentOperation = "";
    this.usersList = data
      .toString()
      .split(",")
      .map((s) => s.trim());
    this.rootStdInListener(Buffer.from(""));
    this.currentSubscription = this.currentObservable?.subscribe(
      this.defaultSubscriber.bind(this)
    );
  }
}

const instance = new CLIConsumer();
