import ClassMeta from "../classes/ClassMeta";
import { metaSymbol } from "../symbols";

export default function Ignore(target: any, fieldName: string) {
    target[metaSymbol] = target[metaSymbol] ?? new ClassMeta();
    target[metaSymbol].addIgnoredField(fieldName);
}