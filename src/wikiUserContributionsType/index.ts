import WikimediaStream from "wikimedia-streams";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";

let typosEditing: number = 0;
let contentAddition: number = 0;

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

const updateWikiUserContributionsType = (data: MediaWikiRecentChangeEditEvent) => {

    if ((data.type == "edit" ? data.minor : false) || data.type == "categorize")
        typosEditing++;
    else if (data.type == "edit" ? !data.minor : data.type == "new")
        contentAddition++;

    return { typosEditing, contentAddition };
};

export const wikiTypoedArticlesStream: Observable<MediaWikiRecentChangeEditEvent> = observable
    .pipe(
        filter((data: MediaWikiRecentChangeEditEvent) =>
            data.user == currentUser
        )
    );

const GenerateWikiUserContributionsType = (user: string) => {
    currentUser = user
    typosEditing = 0
    contentAddition = 0
    wikiTypoedArticlesStream.subscribe(updateWikiUserContributionsType)
};
export { GenerateWikiUserContributionsType };