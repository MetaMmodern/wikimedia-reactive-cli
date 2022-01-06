import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import { observable } from "../recentChangesObservable";
import { filter, map, throttleTime } from "rxjs/operators";

let amountOfContributions: number = 0;
let currentUser: string;

export default (user: string, timeDelay: number) => {
    currentUser = user
    amountOfContributions = 0

    return observable.pipe(
        filter((data: MediaWikiRecentChangeEditEvent) => data.user == currentUser),
        map(_ => ++amountOfContributions),
        throttleTime(timeDelay),
        map(a => {
            amountOfContributions = 0;
            return a;
        }));
};