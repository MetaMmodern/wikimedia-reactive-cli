import WikimediaStream from "wikimedia-streams";
import { Observable } from "rxjs";
import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import UpdateTypesStatistics from "./UpdateTypesStatistics"

const finalValue: UpdateTypesStatistics = new UpdateTypesStatistics;

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

const updateWikiUpdateTypes = (data: MediaWikiRecentChangeEditEvent) => {
    switch (data.type) {
        case "log":
            finalValue.log++;
            break;
        case "new":
            finalValue.new++;
            break;
        case "edit":
            finalValue.edit++;
            break;
        case "categorize":
            finalValue.categorize++;
            break;
        default:
            break;
    }
    return finalValue;
};

const GenerateWikiUpdateTypesSubscription = () => observable.subscribe(updateWikiUpdateTypes);
export { GenerateWikiUpdateTypesSubscription };