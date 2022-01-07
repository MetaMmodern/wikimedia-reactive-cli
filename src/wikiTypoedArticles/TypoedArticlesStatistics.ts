import { filter, map } from "rxjs/operators";
import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import TypoedArticlesStatisticsType from "./TypoedArticlesStatisticsType";
import { observable } from "../recentChangesObservable";

const wikiTypoedArticles: Map<string, number> = new Map();
const finalValue: TypoedArticlesStatisticsType = new TypoedArticlesStatisticsType();

const updateWikiTypoedArticles = (data: MediaWikiRecentChangeEditEvent) => {
  wikiTypoedArticles.set(data.title, (wikiTypoedArticles.get(data.title) ?? 0) + 1);

  finalValue.values = [...wikiTypoedArticles.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  finalValue.totalSize = wikiTypoedArticles.size;

  return finalValue;
};

export default observable.pipe(
  filter((data: MediaWikiRecentChangeEditEvent) =>
    data.type == "edit" ? data.minor : false
  ),
  map(updateWikiTypoedArticles)
);