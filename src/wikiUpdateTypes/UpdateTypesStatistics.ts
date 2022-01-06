import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import { UpdateTypesReturnValue } from "./UpdateTypesStatisticsType";
import { observable } from "../wikiSubscriber";
import { map } from "rxjs/operators";

const finalValue: UpdateTypesReturnValue = {
  log: 0,
  new: 0,
  edit: 0,
  categorize: 0,
};

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
// const GenerateWikiUpdateTypesSubscription = () =>
//   observable.subscribe(updateWikiUpdateTypes);
// export { GenerateWikiUpdateTypesSubscription };
