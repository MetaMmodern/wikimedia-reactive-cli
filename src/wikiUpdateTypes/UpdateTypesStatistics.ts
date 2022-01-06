import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import UpdateTypesStatistics from "./UpdateTypesStatisticsType"
import { observable } from "../wikiSubscriber";

const finalValue: UpdateTypesStatistics = new UpdateTypesStatistics;

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