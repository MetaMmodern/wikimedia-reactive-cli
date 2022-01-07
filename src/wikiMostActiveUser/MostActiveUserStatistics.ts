import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import {
  MostActiveUserStatisticsType,
  MostActiveUserEntry,
} from "./MostActiveUserStatisticsType";
import { map } from "rxjs/operators";
import { observable } from "../recentChangesObservable";

declare type TimeIntervalType = 10000 | 30000 | 60000;
const SEC_10 = 10000;
const SEC_30 = 30000;
const MINUTE = 60000;

const finalValue: MostActiveUserStatisticsType =
  new MostActiveUserStatisticsType();
const sec10Map = new Map<string, number>();
const sec30Map = new Map<string, number>();
const minuteMap = new Map<string, number>();

let latestSec10Date = new Date();
let latestSec30Date = new Date();
let latestMinuteDate = new Date();

const UpdateUsersEdits = (user: string) => {
  const updateUserEditsMap = (user: string, map: Map<string, number>) => {
      map.set(user, (map.get(user) ?? 0) + 1);
  };

  updateUserEditsMap(user, sec10Map);
  updateUserEditsMap(user, sec30Map);
  updateUserEditsMap(user, minuteMap);
};

const GetMostActiveUserOnInterval = (
  timeInterval: TimeIntervalType,
  date: Date
): MostActiveUserEntry => {
  const GetSelectedMap = (time: TimeIntervalType) => {
    switch (time) {
      case SEC_10:
        return sec10Map;
      case SEC_30:
        return sec30Map;
      default:
        return minuteMap;
    }
  };
  const GetFromDate = (time: TimeIntervalType) => {
    switch (time) {
      case SEC_10:
        return latestSec10Date;
      case SEC_30:
        return latestSec30Date;
      default:
        return latestMinuteDate;
    }
  };

  const newUserEntry = new MostActiveUserEntry();
  newUserEntry.fromDate = GetFromDate(timeInterval);
  newUserEntry.toDate = date;

  const editsMap = GetSelectedMap(timeInterval);
  if (editsMap.size > 0) {
    const value = [...editsMap.entries()].sort((a, b) => b[1] - a[1])[0];

    newUserEntry.userName = value[0];
    newUserEntry.contributions = value[1];
  }

  editsMap.clear();
  return newUserEntry;
};

const updateMostActiveUsersStatistics = (
  data: MediaWikiRecentChangeEditEvent
) => {
  UpdateUsersEdits(data.user);

  const date = new Date();
  if (date.getTime() - latestSec10Date.getTime() >= SEC_10) {
    finalValue.sec_10.push(GetMostActiveUserOnInterval(SEC_10, date));
    latestSec10Date = date;
  }
  if (date.getTime() - latestSec30Date.getTime() >= SEC_30) {
    finalValue.sec_30.push(GetMostActiveUserOnInterval(SEC_30, date));
    latestSec30Date = date;
  }
  if (date.getTime() - latestMinuteDate.getTime() >= MINUTE) {
    finalValue.min.push(GetMostActiveUserOnInterval(MINUTE, date));
    latestMinuteDate = date;
  }

  return finalValue;
};

export default observable.pipe(map(updateMostActiveUsersStatistics));
