import chalk from "chalk";
import Table from "cli-table";
import { scan, throttle, interval, map } from "rxjs";
import { drawChart } from "../resources/charts";
import wikiEventsEmitter from "../resources/wiki/wikiEventsEmitter";

export const UpdateStatisticsTextObservable = () => {
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

export const UpdateStatisticsGraphObservable = () => {
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
export const MostActiveUsersObservable = (
  inteval: "min" | "sec_30" | "sec_10" | "sec_1"
) => {
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

export const UserContributionsOverTimeObservable = (
  user: string,
  timeDelay: number
) => {
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
      const chart = drawChart([data.contributions], {
        height: process.stdout.rows - 3,
        colorsNames: ["green"],
      });

      let legend = chalk.green(`■ Contributions by \"${user}\"`);
      const pad = " ".repeat(process.stdout.columns / 2 - legend.length / 2);
      legend = pad + legend;
      return chart + "\n" + legend;
    })
  );
};

export const UserContributionsStatisticsObservable = (user: string) => {
  return wikiEventsEmitter.GetUserStatistics(user).pipe(
    map((el) => {
      const userNameString = `User: ${chalk.cyanBright(user)}\n`;
      const contentAdditionString = `contentAddition: ${chalk.cyanBright(
        el.contentAddition
      )}\n`;
      const typosEditingString = `typosEditing: ${chalk.cyanBright(
        el.typosEditing
      )}\n`;
      const topArticles = new Table({
        head: ["Article", "Contributions"],
      });
      el.topArticleContributions.forEach((article) =>
        topArticles.push([article[0], article[1]])
      );
      return (
        userNameString +
        contentAdditionString +
        typosEditingString +
        topArticles.toString()
      );
    })
  );
};

export const MostTypoedArticlesObservable = () => {
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
