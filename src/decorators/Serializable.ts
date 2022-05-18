import { Constructor } from "../types";
import { dependenciesSymbol, labelSymbol, serializableIndicatorSymbol, serializerSymbol } from "../symbols";
import Serializer from "../classes/Serializer";
import SerializationResult from "../interfaces/SerializationResult";
import Deserializer from "../classes/Deserializer";

export default function Serializable(label: string, dependencies: Function[] = []) {
    return function<T extends Constructor>(constructor: T) {
        let parentDependencies = constructor[dependenciesSymbol] ?? [];
        
        constructor[labelSymbol] = label;
        constructor[dependenciesSymbol] = [...dependencies, ...parentDependencies];
        constructor[serializableIndicatorSymbol] = true;

        return class extends constructor {
            [serializableIndicatorSymbol] = true;
            [labelSymbol] = label;

            async serialize() {
                let serializer = new Serializer(this);
                return await serializer.result();
            }

            static async deserialize(input: SerializationResult) {
                let deserializer = new Deserializer(this);
                return await deserializer.deserialize({input: input});
            }
        }
    }
}