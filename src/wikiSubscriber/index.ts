import WikimediaStream from "wikimedia-streams";
import { Observable } from "rxjs";
import MediaWikiRecentChangeEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";

//TODO: make Observable out of this

export const observable: Observable<MediaWikiRecentChangeEvent> = new Observable(
  (observer) => {
    const stream = new WikimediaStream("recentchange");
    stream.on("recentchange", (data) => observer.next(data));

    return () => {
      console.log("Everyone unsubscribed.");
      stream.close();
    };
  }
);