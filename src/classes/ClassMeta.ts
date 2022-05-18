export default class ClassMeta {
    private ignoredFields: string[] = [];

    addIgnoredField(name: string) {
        this.ignoredFields.push(name);
    }

    isIgnored(name: string) {
        return this.ignoredFields.includes(name);
    }
}