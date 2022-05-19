import SerializedObject from "../interfaces/SerializedObject";
import ClassMeta from "./ClassMeta";
import { labelSymbol, metaSymbol, serializableIndicatorSymbol, serializerSymbol } from "../symbols";
import { genId } from "../utils/genId";
import blobToBase64 from "../utils/blobToBase64";
import SerializationResult from "../interfaces/SerializationResult";
import Plugin from "./Plugin";

interface PluginResult {
    resolved: boolean
    value: unknown
}

export default class Serializer {
    private objects: Map<object, SerializedObject> = new Map<object, SerializedObject>();
    private plugins: Plugin[] = [];

    async serializeValue(value: any, onlyChildren = false) {
        if (value === null || value === undefined) {
            return value;
        }
        
        let meta = value[metaSymbol] ?? new ClassMeta();

        if (this.objects.has(value)) {
            let entry = this.objects.get(value);

            return {
                $ref: entry.$id,
            };
        }

        if (value[serializableIndicatorSymbol] && !onlyChildren) {
            let id = genId();

            let classConstructor = Object.getPrototypeOf(Object.getPrototypeOf(value).constructor);
            let serializedValue = {
                $id: id,
                $name: classConstructor[labelSymbol] || classConstructor.name,
                ...await this.serializeValue(value, true),
            };

            this.objects.set(value, serializedValue);

            return { $ref: id };
        }

        let result = await this.resolvePlugins(value);

        if (result.resolved) {
            return result.value;
        }

        if (Array.isArray(value)) {
            let items = [];

            for (let arrayValue of value) {
                items.push(await this.serializeValue(arrayValue));
            }

            return items;
        }

        if (value instanceof Blob) {
            return await blobToBase64(value);
        }

        if (typeof value === "object") {
            let mappedValues = [];

            for (let [key, objectValue] of Object.entries(value)) {
                if (meta.isIgnored(key)) {
                    continue;
                }

                mappedValues.push([key, await this.serializeValue(objectValue)]);
            }

            return Object.fromEntries(mappedValues);
        }

        return value;
    }

    async serialize(initializer: object): Promise<SerializationResult> {
        let value = await this.serializeValue(initializer);

        return {
            objects: Array.from(this.objects.values()),
            //@ts-ignore
            value,
        }
    }

    private async resolvePlugins(value: unknown): Promise<PluginResult> {
        let matchingPlugings = this.plugins.filter(plugin => plugin.match(value));

        if (matchingPlugings.length > 1) {
            console.warn(`Multiple plugins matched for '${value}'. Using the first match.`);
        }

        let matchedPlugin = matchingPlugings[0];

        if (!matchedPlugin) {
            return {
                resolved: false,
                value: null,
            }
        }

        

        return {
            resolved,
            value: null,
        }
    }
}
