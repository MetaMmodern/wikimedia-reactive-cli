import WikimediaStream from "wikimedia-streams";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import TypoContributedTopic from "./TypoContributedTopic";

const wikiTypoedArticles: Map<string, number> = new Map();
const finalValue: TypoContributedTopic = new TypoContributedTopic;
let currentUser: string;

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

const updateWikiTypoContributedTopic = (data: MediaWikiRecentChangeEditEvent) => {
    wikiTypoedArticles.set(data.title, wikiTypoedArticles.get(data.title) ?? 0 + 1);

    finalValue.values = [...wikiTypoedArticles.entries()].sort((a, b) => b[1] - a[1]);

    return finalValue.values.slice(0, 10);
};

export const wikiTypoedArticlesStream: Observable<MediaWikiRecentChangeEditEvent> = observable
    .pipe(
        filter((data: MediaWikiRecentChangeEditEvent) =>
            data.user == currentUser
        )
    );

const GenerateWikiTypoedContributedTopic = (user : string) => {
    currentUser = user
    wikiTypoedArticlesStream.subscribe(updateWikiTypoContributedTopic)
};
export { GenerateWikiTypoedContributedTopic };