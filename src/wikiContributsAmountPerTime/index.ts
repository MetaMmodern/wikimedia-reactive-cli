import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import { observable } from "../wikiSubscriber";

let amountOfContributions: number = 0;

let currentUser: string;
let latestSecDate = Date.now();
let seconds: number = 10000;

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

const GenerateWikiUserContributsAmountPerTime = (user : string, timeDelay: number) => {
    currentUser = user
    amountOfContributions = 0
    seconds = timeDelay
    observable.subscribe(updateWikiContributsAmountPerTime)
};
export { GenerateWikiUserContributsAmountPerTime };