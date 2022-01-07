import { Subscription, map, timer } from "rxjs";
import MostActiveUserStatistics from "../wikiMostActiveUser/MostActiveUserStatistics";
import { MostActiveUserStatisticsType } from "../wikiMostActiveUser/MostActiveUserStatisticsType";
import TypoedArticlesStatistics from "../wikiTypoedArticles/TypoedArticlesStatistics";
import TypoedArticlesStatisticsType from "../wikiTypoedArticles/TypoedArticlesStatisticsType";
import UpdateTypesStatistics from "../wikiUpdateTypes/UpdateTypesStatistics";
import { wikiEventStatisticsType } from "../wikiUpdateTypes/UpdateTypesStatisticsType";
import wikiUserContributionsOverTime from "../wikiUserContributionsOverTime";
import wikiUserStatistics from "../wikiUserStatistics";

class WikiEventsEmitter {
    typoedArticlesStatisticsSubscription: Subscription;
    typoedArticlesStatisticsValue: TypoedArticlesStatisticsType = new TypoedArticlesStatisticsType();

    mostActiveUserStatisticsSubscription: Subscription;
    mostActiveUserStatisticsValue: MostActiveUserStatisticsType = new MostActiveUserStatisticsType();

    wikiEventStatisticsSubscription: Subscription;
    wikiEventStatisticsValue: wikiEventStatisticsType = new wikiEventStatisticsType();

    constructor() {
        this.typoedArticlesStatisticsSubscription = TypoedArticlesStatistics.subscribe(
            (data: TypoedArticlesStatisticsType) => this.typoedArticlesStatisticsValue = data
        );

        this.mostActiveUserStatisticsSubscription = MostActiveUserStatistics.subscribe(
            (data: MostActiveUserStatisticsType) => this.mostActiveUserStatisticsValue = data
        );

        this.wikiEventStatisticsSubscription = UpdateTypesStatistics.subscribe(
            (data: wikiEventStatisticsType) => this.wikiEventStatisticsValue = data
        );
    }

    GetTypoedArticlesStatistics() {
        return timer(0, 500).pipe(
            map(_ => this.typoedArticlesStatisticsValue)
        );
    }

    GetMostActiveUserStatistics() {
        return timer(0, 1000).pipe(
            map(_ => this.mostActiveUserStatisticsValue)
        );
    }

    GetUpdateTypesStatistics() {
        return timer(0, 100).pipe(
            map(_ => this.wikiEventStatisticsValue)
        );
    }

    GetUserStatistics = (user: string) => wikiUserStatistics(user);

    GetUserContributionsOverTime = (user: string, timeDelay: number) => wikiUserContributionsOverTime(user, timeDelay);
}

export default new WikiEventsEmitter()