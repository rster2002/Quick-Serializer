import { Constructor } from "../types";
import { dependenciesSymbol, labelSymbol, serializableIndicatorSymbol, serializerSymbol } from "../symbols";

export default function Serializable(label: string, dependencies: Function[] = []) {
    return function<T extends Constructor>(constructor: T) {
        let parentDependencies = constructor[dependenciesSymbol] ?? [];
        
        constructor[labelSymbol] = label;
        constructor[dependenciesSymbol] = [...dependencies, ...parentDependencies];
        constructor[serializableIndicatorSymbol] = true;
        
        //@ts-ignore
        constructor.addDependencies = function (dependencies: Function[]) {
            constructor[dependenciesSymbol] = [
                ...constructor[dependenciesSymbol],
                ...dependencies,
            ];
        }
    }
}