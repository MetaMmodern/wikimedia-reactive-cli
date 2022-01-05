import WikimediaStream from "wikimedia-streams";
import { Observable } from "rxjs";
import { map, tap, filter } from "rxjs/operators";
import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";

const wikiTypoedArticles: Map<string, number> = new Map();


const observable: Observable<MediaWikiRecentChangeEditEvent> = new Observable(
    (observer) => {
        const stream = new WikimediaStream("recentchange");
        stream.on("recentchange", (data) => observer.next(data));

        return () => {
            console.log("Everyone unsubscribed.");
            stream.close();
        };
    }
);

const updateWikiTypoedArticles = (data: MediaWikiRecentChangeEditEvent) => {
    wikiTypoedArticles.set(data.title, wikiTypoedArticles.get(data.title) ?? 0 + 1);

    if (wikiTypoedArticles.size > 0) {
        process.stdout.clearLine(-1);
        process.stdout.write('\x1Bc');
    }

    let counter: number = 0;
    for (const [key, value] of [...wikiTypoedArticles.entries()].sort((a, b) => a[1] - b[1]).slice(0, 10))
        process.stdout.write(`${++counter}) ${key} - ${value}\n`);
};

const mystream: Observable<MediaWikiRecentChangeEditEvent> = observable
    .pipe(
        // filter((data: MediaWikiRecentChangeEditEvent) =>
        //     data.wiki == 'enwiki'
        // ),
        filter((data: MediaWikiRecentChangeEditEvent) =>
            data.type == "edit" ? data.minor : false
        ),
        map(
            _ => _
        )
    );

let subscription = mystream.subscribe(updateWikiTypoedArticles);

setTimeout(() => {
    subscription.unsubscribe();
    setTimeout(() => {
        subscription = mystream.subscribe(updateWikiTypoedArticles);
    }, 500);
}, 3000);
