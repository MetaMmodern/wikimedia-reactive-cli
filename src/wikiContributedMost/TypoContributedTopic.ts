export interface TypoContributedTopicValue {
    values: Array<[string, number]>
}

class TypoContributedTopic implements TypoContributedTopicValue {
    values = new Array<[string, number]>()
}
export default TypoContributedTopic;