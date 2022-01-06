import WikimediaStream from "wikimedia-streams";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";

let amountOfContributions: number = 0;

let currentUser: string;
let latestSecDate = Date.now();
let seconds: number = 10000;

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

const updateWikiContributsAmountPerTime = (data: MediaWikiRecentChangeEditEvent) => {
    const date = Date.now();

    if (date - latestSecDate >= seconds) {
        console.log({amountOfContributions})
        amountOfContributions = 0;
        latestSecDate = date;
    }

    if (data.user == currentUser)
    {
        amountOfContributions++;
    }

    return {amountOfContributions};
};

export const wikiTypoedArticlesStream: Observable<MediaWikiRecentChangeEditEvent> = observable
    .pipe(
        // filter((data: MediaWikiRecentChangeEditEvent) =>
        //     data.user == currentUser
        // )
    );

const GenerateWikiUserContributsAmountPerTime = (user : string, timeDelay: number) => {
    currentUser = user
    amountOfContributions = 0
    seconds = timeDelay
    wikiTypoedArticlesStream.subscribe(updateWikiContributsAmountPerTime)
};
export { GenerateWikiUserContributsAmountPerTime };

GenerateWikiUserContributsAmountPerTime("InternetArchiveBot", 1000)