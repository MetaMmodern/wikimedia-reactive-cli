class CLIConsumer {
  readonly baseActions = {
    "[u]": "users",
    "[i]": "interval",
    "[m]": "mode",
    "[s]": "stats",
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

  constructor() {
    this.logWithUserPrompt("");
    process.stdin.addListener("data", this.rootStdInListener.bind(this));
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
    process.stdout.write(output);
    process.stdout.write(
      Object.entries(this.baseActions)
        .map((entry) => entry[0] + entry[1].slice(1))
        .join(" ") + " => "
    );
  }

  promptUsersList() {
    console.clear();
    this.currentOperation = "user_selection";
    process.stdout.write("Enter coma seperated users filter list: ");
  }

  actionsListener(data: Buffer) {
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
    this.currentOperation = "";
    this.usersList = data
      .toString()
      .split(",")
      .map((s) => s.trim());
    this.rootStdInListener(Buffer.from(""));
  }
}

const instance = new CLIConsumer();
