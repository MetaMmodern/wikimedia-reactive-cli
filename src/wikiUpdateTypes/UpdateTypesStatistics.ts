export interface UpdateTypesReturnValue {
    log: number,
    new: number,
    edit: number,
    categorize: number
}

class UpdateTypesStatistics implements UpdateTypesReturnValue {
    log = 0;
    new = 0;
    edit = 0;
    categorize = 0;
}
export default UpdateTypesStatistics;