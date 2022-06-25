import SerializedObject from "../interfaces/SerializedObject";
import ClassMeta from "./ClassMeta";
import { dependenciesSymbol, labelSymbol, metaSymbol, serializableIndicatorSymbol } from "../symbols";
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
    private knownConstructors = new Set<Function>();
    private serializedValues = new Set<unknown>();
    private objects = new Map<object, SerializedObject>();
    private plugins: Plugin[] = [
        new FilePlugin(),
        new BlobPlugin(),
    ];

    async serialize(initializer: object): Promise<SerializationResult> {
        this.serializedValues.clear();
        let value = await this.serializeValue(initializer);

        return {
            objects: Array.from(this.objects.values()),
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

            this.objects.set(value, {
                $id: id,
                $name: "$temp",
                $value: null,
            });

            let isSerializableClass = value.constructor !== undefined && value.constructor[serializableIndicatorSymbol];

            if (isSerializableClass && !onlyChildren) {
                name = value.constructor[labelSymbol];
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
            let id = genId();
            this.objects.set(value, {
                $id: id,
                $name: "$plugin",
                $value: result.value,
            });

            return { $ref: id };
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

    async deserialize(baseConstructor: Function, serializedResult: SerializationResult) {
        this.knownConstructors.clear();
        this.crawlConstructor(baseConstructor);

        let nameConstructorMap = new Map<string, Function>();
        for (let constructor of Array.from(this.knownConstructors)) {
            nameConstructorMap.set(constructor[labelSymbol], constructor);
        }

        let createdObjectsById = new Map<string, unknown>();
        for (let serializedObject of serializedResult.objects) {
            let name = serializedObject.$name;

            if (name === "$object") {
                createdObjectsById.set(serializedObject.$id, {
                    //@ts-ignore
                    ...serializedObject.$value,
                });

                continue;
            }

            if (name === "$array") {
                createdObjectsById.set(serializedObject.$id, [
                    //@ts-ignore
                    ...serializedObject.$value,
                ]);

                continue;
            }

            let constructor = nameConstructorMap.get(name);

            if (constructor === undefined) {
                throw new Error(`Missing constructor for '${serializedObject.$id}' (missing constructor with name '${serializedObject.$name}')`);
            }

            let object = Object.create(constructor.prototype);
            for (let [key, value] of Object.entries(serializedObject.$value)) {
                object[key] = value;
            }

            createdObjectsById.set(serializedObject.$id, object)
        }

        for (let ref of Array.from(createdObjectsById.keys())) {
            let object = createdObjectsById.get(ref);

            for (let key of Object.keys(object)) {
                let value = object[key];

                if (this.isRef(value)) {
                    let refId = value.$ref;
                    object[key] = createdObjectsById.get(refId);
                }
            }
        }

        return createdObjectsById.get(serializedResult.value.$ref);
    }

    private crawlConstructor(constructor: Function) {
        this.knownConstructors.add(constructor);

        let dependencyFunctions = constructor[dependenciesSymbol];
        if (dependencyFunctions) {
            for (let dependencyFunction of dependencyFunctions) {
                let dependencies = dependencyFunction();

                for (let dependencyConstructor of dependencies) {
                    if (!this.knownConstructors.has(dependencyConstructor)) {
                        this.crawlConstructor(dependencyConstructor);
                    }
                }
            }
        }
    }

    private isRef(value: unknown) {
        return typeof value === "object"
            && value !== null
            && Object.keys(value).length === 1
            //@ts-ignore
            && typeof value.$ref === "string";
    }
}
