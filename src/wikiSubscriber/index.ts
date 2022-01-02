import chalk from "chalk";
import WikimediaStream from "wikimedia-streams";
import { Observable } from "rxjs";
import { map, tap, filter } from "rxjs/operators";
import MediaWikiRecentChangeEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";

//TODO: make Observable out of this

const observable: Observable<MediaWikiRecentChangeEvent> = new Observable(
  (observer) => {
    const stream = new WikimediaStream("recentchange");
    stream.on("recentchange", (data) => observer.next(data));

    return () => {
      console.log("Everyone unsubscribed.");
      stream.close();
    };
  }
);

const myObserver = (data: string) => {
  console.log(data);
};
const mystream = observable
  .pipe(
    tap(() => console.log("tap")),
    filter((data) => !data.bot),
    map((data) =>
      chalk.bgBlue.black(`${data.bot ? "Bot:" : "User:"} ${data.user}.`)
    )
  )
  .subscribe(myObserver);

setTimeout(() => {
  mystream.unsubscribe();
}, 3000);
