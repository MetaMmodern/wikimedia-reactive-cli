import WikimediaStream from "wikimedia-streams";
import { Observable } from "rxjs";
import { map, tap, filter } from "rxjs/operators";
import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import TypoedArticlesStatistics from "./valueType"

const wikiTypoedArticles: Map<string, number> = new Map();
const finalValue: TypoedArticlesStatistics = new TypoedArticlesStatistics;

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

    finalValue.values = [...wikiTypoedArticles.entries()].sort((a, b) => a[1] - b[1]).slice(0, 10);
    finalValue.totalSize = wikiTypoedArticles.size;

    return finalValue;
};

const wikiTypoedArticlesStream: Observable<MediaWikiRecentChangeEditEvent> = observable
    .pipe(
        // filter((data: MediaWikiRecentChangeEditEvent) =>
        //     data.wiki == 'enwiki'
        // ),
        filter((data: MediaWikiRecentChangeEditEvent) =>
            data.type == "edit" ? data.minor : false
        ),
        map(_ => _)
    );

export let wikiTypoedArticlesSubscription = wikiTypoedArticlesStream.subscribe(updateWikiTypoedArticles);

setTimeout(() => {
    wikiTypoedArticlesSubscription.unsubscribe();
    setTimeout(() => {
        wikiTypoedArticlesSubscription = wikiTypoedArticlesStream.subscribe(updateWikiTypoedArticles);
    }, 500);
}, 3000);
