import { filter, map } from "rxjs/operators";
import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import UserStatisticsType from "./UserStatisticsType";
import { observable } from "../wikiSubscriber";

const wikiTypoedArticles: Map<string, number> = new Map();
const finalValue: UserStatisticsType = new UserStatisticsType();
let currentUser: string;

const updateUserStatistics = (
  data: MediaWikiRecentChangeEditEvent
) => {
  wikiTypoedArticles.set(
    data.title,
    wikiTypoedArticles.get(data.title) ?? 0 + 1
  );

  finalValue.topArticleContributions = [...wikiTypoedArticles.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  if ((data.type == "edit" ? data.minor : false) || data.type == "categorize")
    finalValue.typosEditing++;
  else if (data.type == "edit" ? !data.minor : data.type == "new")
    finalValue.contentAddition++;

  return finalValue;
};

export default (user: string) => {
  currentUser = user;

  return observable.pipe(
    filter((data: MediaWikiRecentChangeEditEvent) => data.user == currentUser),
    map(updateUserStatistics)
  );
};
