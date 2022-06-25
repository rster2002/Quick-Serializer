import { Constructor } from "../types";
import { dependenciesSymbol, labelSymbol, serializableIndicatorSymbol, serializerSymbol } from "../symbols";

export default function Serializable(label: string, dependencies?: () => Function[]) {
    return function<T extends Constructor>(constructor: T) {
        let currentDependencies = constructor[dependenciesSymbol] ?? new Set();

        constructor[labelSymbol] = label;

        currentDependencies.add(() => [constructor]);
        if (dependencies) {
            currentDependencies.add(dependencies);
        }

        constructor[dependenciesSymbol] = currentDependencies;

        constructor[serializableIndicatorSymbol] = true;
    }
}
