export interface TypoedArticlesReturnValue {
    values: Array<[string, number]>,
    totalSize: number
}

declare type TypoedArticlesStatistics = TypoedArticlesReturnValue;
export default TypoedArticlesStatistics;