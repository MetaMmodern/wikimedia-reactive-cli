import WikimediaStream from "wikimedia-streams";
import { Observable } from "rxjs";
import MediaWikiRecentChangeEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";

export const observable: Observable<MediaWikiRecentChangeEvent> =
  new Observable((observer) => {
    const stream = new WikimediaStream("recentchange");
    stream.on("recentchange", (data) => observer.next(data));
    stream.on("error", (err) => {
      console.error(err);
    });

    return () => {
      console.log("Everyone unsubscribed.");
      stream.close();
    };
  });
