import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";

import { filter, map } from "rxjs/operators";
import { observable } from "../recentChangesObservable";

export default (user: string) => {
  return observable.pipe(
    filter((data: MediaWikiRecentChangeEditEvent) => data.user == user),
    map((_) => 1)
  );
};
