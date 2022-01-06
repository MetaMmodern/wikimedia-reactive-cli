export interface MostActiveUserEntryValue {
    fromDate: Date,
    toDate: Date,
    userName: string,
    contributions: number
}

export interface MostActiveUserReturnValue {
    sec_10: Array<MostActiveUserEntryValue>,
    sec_30: Array<MostActiveUserEntryValue>,
    min: Array<MostActiveUserEntryValue>,
}

export class MostActiveUserEntry {
    fromDate = new Date();
    toDate = new Date();
    userName = "";
    contributions = -1;
}

export class MostActiveUserStatisticsType implements MostActiveUserReturnValue {
    sec_10 = new Array<MostActiveUserEntryValue>();
    sec_30 = new Array<MostActiveUserEntryValue>();
    min = new Array<MostActiveUserEntryValue>();
}