import WikimediaStream from "wikimedia-streams";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import TypoedArticlesStatistics from "./TypoedArticlesStatistics"

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

export const wikiTypoedArticlesStream: Observable<MediaWikiRecentChangeEditEvent> = observable
    .pipe(
        filter((data: MediaWikiRecentChangeEditEvent) =>
            data.type == "edit" ? data.minor : false
        )
    );

const GenerateWikiTypoedArticlesSubscription = () => wikiTypoedArticlesStream.subscribe(updateWikiTypoedArticles);
export { GenerateWikiTypoedArticlesSubscription };