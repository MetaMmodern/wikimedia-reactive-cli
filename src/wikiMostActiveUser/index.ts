import WikimediaStream from "wikimedia-streams";
import { Observable } from "rxjs";
import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import MostActiveUserStatistics from "./MostActiveUserStatistics"

const SEC_10 = 10000;
const SEC_30 = 30000;
const MINUTE = 60000;

const finalValue: MostActiveUserStatistics = new MostActiveUserStatistics;
const sec10Map = new Map<string, number>();
const sec30Map = new Map<string, number>();
const minuteMap = new Map<string, number>();

let latestSec10Date = Date.now();
let latestSec30Date = Date.now();
let latestMinuteDate = Date.now();

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

const UpdateUsersEdits = (user: string) => {
    const updateUserEditsMap = (user: string, map: Map<string, number>) => {
        map.set(user, map.get(user) ?? 0 + 1);
    };

    updateUserEditsMap(user, sec10Map);
    updateUserEditsMap(user, sec30Map);
    updateUserEditsMap(user, minuteMap);
}

const GetMostActiveUserOnInterval = (timeInterval: number): [string, number] => {
    

    const value = ;
    editsMap.clear();

    return value;
}

const updateMostActiveUsersStatistics = (data: MediaWikiRecentChangeEditEvent) => {
    UpdateUsersEdits(data.user);

    const date = Date.now();
    if (date - latestSec10Date >= SEC_10) {
        finalValue.sec_10.push(date, GetMostActiveUserOnInterval(SEC_10));
        latestSec10Date = date;
    }

    console.log(finalValue);

    return finalValue;
};

const GenerateWikiMostActiveUsersStatisticsSubscription = () => observable.subscribe(updateMostActiveUsersStatistics);
export { GenerateWikiMostActiveUsersStatisticsSubscription };