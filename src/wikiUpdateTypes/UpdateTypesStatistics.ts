import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import { wikiEventStatisticsType } from "./UpdateTypesStatisticsType";
import { observable } from "../wikiSubscriber";
import { map } from "rxjs/operators";

const finalValue: wikiEventStatisticsType = new wikiEventStatisticsType();

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

export default observable.pipe(map(updateWikiUpdateTypes));