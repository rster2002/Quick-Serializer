import SerializedObject from "../interfaces/SerializedObject";
import ClassMeta from "./ClassMeta";
import { labelSymbol, metaSymbol, serializableIndicatorSymbol } from "../symbols";
import { genId } from "../utils/genId";
import SerializationResult from "../interfaces/SerializationResult";
import Plugin from "./Plugin";
import FilePlugin from "./plugins/FilePlugin";
import BlobPlugin from "./plugins/BlobPlugin";

interface PluginResult {
    resolved: boolean
    value: unknown
}

export default class Serializer {
    private objects: Map<object, SerializedObject> = new Map<object, SerializedObject>();
    private plugins: Plugin[] = [
        new FilePlugin(),
        new BlobPlugin(),
    ];

    async serialize(initializer: object): Promise<SerializationResult> {
        let value = await this.serializeValue(initializer);

        return {
            objects: Array.from(this.objects.values()),
            //@ts-ignore
            value,
        }
    }
    
    addPlugin(plugin: Plugin) {
        this.plugins.push(plugin);
    }
    
    async serializeValue(value: any, onlyChildren = false) {
        if (value === null || value === undefined) {
            return value;
        }

        if (this.objects.has(value)) {
            let entry = this.objects.get(value);

            return {
                $ref: entry.$id,
            };
        }
        
        if (value instanceof Object) {
            let id = genId();
            let name;
            let serializedValue;
            
            if (value[serializableIndicatorSymbol] && !onlyChildren) {
                name = Object.getPrototypeOf(Object.getPrototypeOf(value).constructor)[labelSymbol];
                serializedValue = await this.serializeSerializable(value);
            } else if (Array.isArray(value)) {
                name = "$array";
                serializedValue = await this.serializeArray(value);
            } else {
                name = "$object";
                serializedValue = await this.serializeObject(value);
            }
            
            this.objects.set(value, {
                $id: id,
                $name: name,
                $value: serializedValue,
            })
            
            return { $ref: id };
        }

        let result = await this.resolvePlugins(value);

        if (result.resolved) {
            return result.value;
        }
        
        return value;
    }
    
    private async serializeSerializable(value: object) {
        let classConstructor = Object.getPrototypeOf(Object.getPrototypeOf(value).constructor);
        return await this.serializeObject(value);
    }
    
    private async serializeArray(value: unknown[]) {
        let items = [];

        for (let arrayValue of value) {
            items.push(await this.serializeValue(arrayValue));
        }

        return items;
    }
    
    private async serializeObject(value: object) {
        let meta = value[metaSymbol] ?? new ClassMeta();
        let mappedValues = [];

        for (let [key, objectValue] of Object.entries(value)) {
            if (meta.isIgnored(key)) {
                continue;
            }

            mappedValues.push([key, await this.serializeValue(objectValue)]);
        }

        return Object.fromEntries(mappedValues);
    }

    private async resolvePlugins(value: unknown): Promise<PluginResult> {
        let matchingPlugins = this.plugins.filter(plugin => plugin.match(value));
        let matchedPlugin = matchingPlugins[0];

        if (!matchedPlugin) {
            return {
                resolved: false,
                value: null,
            }
        }

        let pluginResult = await matchedPlugin.serialize(value);

        return {
            resolved: true,
            value: {
                $plugin: matchedPlugin.getName(),
                $value: pluginResult,
            },
        }
    }
}
