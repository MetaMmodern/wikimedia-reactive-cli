import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import TypoedArticlesStatistics from "./TypoedArticlesStatisticsType";
import { observable } from "../wikiSubscriber";

const wikiTypoedArticles: Map<string, number> = new Map();
const finalValue: TypoedArticlesStatistics = new TypoedArticlesStatistics();

const updateWikiTypoedArticles = (data: MediaWikiRecentChangeEditEvent) => {
  wikiTypoedArticles.set(
    data.title,
    wikiTypoedArticles.get(data.title) ?? 0 + 1
  );

  finalValue.values = [...wikiTypoedArticles.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  finalValue.totalSize = wikiTypoedArticles.size;

  return finalValue;
};

export const wikiTypoedArticlesStream: Observable<MediaWikiRecentChangeEditEvent> =
  observable.pipe(
    filter((data: MediaWikiRecentChangeEditEvent) =>
      data.type == "edit" ? data.minor : false
    )
  );

const GenerateWikiTypoedArticlesSubscription = () =>
  wikiTypoedArticlesStream.subscribe(updateWikiTypoedArticles);
export { GenerateWikiTypoedArticlesSubscription };
