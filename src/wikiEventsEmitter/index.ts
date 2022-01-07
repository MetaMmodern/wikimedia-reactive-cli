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
    userContributionsOverTimeSubscription: Subscription | undefined;
    userContributionsOverTimeValue: number = 0;

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

    GetUserContributionsOverTime(user: string, timeDelay: number) {
        this.userContributionsOverTimeSubscription = wikiUserContributionsOverTime(user).subscribe(
            (data: number) => this.userContributionsOverTimeValue += data
        );

        return timer(timeDelay, timeDelay).pipe(
            map(_ => {
                const returnValue = this.userContributionsOverTimeValue;
                this.userContributionsOverTimeValue = 0;
                return returnValue;
            })
        );
    }

    GetUserStatistics = (user: string) => wikiUserStatistics(user);
}

const wikiEventsEmitter = new WikiEventsEmitter();
export default wikiEventsEmitter;