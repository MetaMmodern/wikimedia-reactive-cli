import { Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import { observable } from "../wikiSubscriber";

let typosEditing: number = 0;
let contentAddition: number = 0;

let currentUser: string;

const updateWikiUserContributionsType = (data: MediaWikiRecentChangeEditEvent) => {

    if ((data.type == "edit" ? data.minor : false) || data.type == "categorize")
        typosEditing++;
    else if (data.type == "edit" ? !data.minor : data.type == "new")
        contentAddition++;

    return { typosEditing, contentAddition };
};

const GenerateWikiUserContributionsType = (user: string) => {
    currentUser = user
    typosEditing = 0
    contentAddition = 0

    return observable.pipe(
        filter((data: MediaWikiRecentChangeEditEvent) =>
            data.user == currentUser
        ),
        map(updateWikiUserContributionsType));
};
export default GenerateWikiUserContributionsType;