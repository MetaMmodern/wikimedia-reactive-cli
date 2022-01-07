import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import { observable } from "../recentChangesObservable";
import { filter, map } from "rxjs/operators";

export default (user: string) => {
    return observable.pipe(
        filter((data: MediaWikiRecentChangeEditEvent) => data.user == user),
        map(_ => 1)
    );
};