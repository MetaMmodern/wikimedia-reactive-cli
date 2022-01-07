export interface TypoedArticlesReturnValue {
    values: Array<[string, number]>,
    totalSize: number
}

class TypoedArticlesStatisticsType implements TypoedArticlesReturnValue {
    values = new Array<[string, number]>();
    totalSize = 0;
}
export default TypoedArticlesStatisticsType;