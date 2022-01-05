export interface MostActiveUserReturnValue {
    sec_10: Array<[Date, [string, number]]>,
    sec_30: Array<[Date, [string, number]]>,
    min: Array<[Date, [string, number]]>,
}

class MostActiveUserStatistics implements MostActiveUserReturnValue {
    sec_10 = new Array<[Date, [string, number]]>();
    sec_30 = new Array<[Date, [string, number]]>();
    min = new Array<[Date, [string, number]]>();
}
export default MostActiveUserStatistics;