import { filter, map } from "rxjs/operators";
import MediaWikiRecentChangeEditEvent from "wikimedia-streams/build/streams/MediaWikiRecentChangeEvent";
import TypoContributedTopic from "./TypoContributedTopic";
import { observable } from "../wikiSubscriber";

const wikiTypoedArticles: Map<string, number> = new Map();
const finalValue: TypoContributedTopic = new TypoContributedTopic();
let currentUser: string;

const updateWikiTypoContributedTopic = (
  data: MediaWikiRecentChangeEditEvent
) => {
  wikiTypoedArticles.set(
    data.title,
    wikiTypoedArticles.get(data.title) ?? 0 + 1
  );

  finalValue.values = [...wikiTypoedArticles.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  return finalValue.values.slice(0, 10);
};

const GenerateWikiTypoedContributedTopic = (user: string) => {
  currentUser = user;

  return observable.pipe(
    filter((data: MediaWikiRecentChangeEditEvent) => data.user == currentUser),
    map(updateWikiTypoContributedTopic)
  );
};
export default GenerateWikiTypoedContributedTopic;
