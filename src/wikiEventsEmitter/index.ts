import { Subscription, of, retry, map, interval, timer } from "rxjs";
import MostActiveUserStatistics from "../wikiMostActiveUser/MostActiveUserStatistics";
import { MostActiveUserStatisticsType } from "../wikiMostActiveUser/MostActiveUserStatisticsType";
import TypoedArticlesStatistics from "../wikiTypoedArticles/TypoedArticlesStatistics";
import TypoedArticlesStatisticsType from "../wikiTypoedArticles/TypoedArticlesStatisticsType";
import UpdateTypesStatistics from "../wikiUpdateTypes/UpdateTypesStatistics";
import { wikiEventStatisticsType } from "../wikiUpdateTypes/UpdateTypesStatisticsType";
import wikiUserContributionsOverTime from "../wikiUserContributionsOverTime";
import wikiUserStatistics from "../wikiUserStatistics";
import UserStatisticsType from "../wikiUserStatistics/UserStatisticsType";

const EMIT_FREQUENCY: number = 100;
class WikiEventsEmitter {
    userContributionsPerTimeSubscription: Subscription | undefined;

    userStatisticsTypeSubsruption: Subscription | undefined;
    userStatisticsValue: UserStatisticsType = new UserStatisticsType();

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
        return timer(0, 100).pipe(
            map(_ => this.typoedArticlesStatisticsValue)
        );
    }

    GetMostActiveUserStatistics() {
        return timer(0, 100).pipe(
            map(_ => this.mostActiveUserStatisticsValue)
        );
    }

    GetUpdateTypesStatistics() {
        return timer(0, 100).pipe(
            map(_ => this.wikiEventStatisticsValue)
        );
    }

    GetUserStatistics(user: string) {
        return this.userStatisticsTypeSubsruption = wikiUserStatistics(user).subscribe(
            (data: UserStatisticsType) => this.userStatisticsValue = data
        );
    }

    GetUserContributionsOverTime(user: string, timeDelay: number) {
        return this.userStatisticsTypeSubsruption = wikiUserContributionsOverTime(user, timeDelay).subscribe(
            (data: number) => data
        );
    }
}

export default new WikiEventsEmitter()