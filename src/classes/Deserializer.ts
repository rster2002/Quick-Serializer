import SerializedObject from "../interfaces/SerializedObject";
import { Constructor } from "../types";
import { dependenciesSymbol, labelSymbol } from "../symbols";
import SerializationResult from "../interfaces/SerializationResult";
import SerializedObjectRef from "../interfaces/SerializedObjectRef";

export default class Deserializer {
    private objectByRef = new Map<string, SerializedObject>();
    private constructors = new Map<string, Constructor>();
    private initializer: Constructor;

    constructor(initializer: Constructor) {
        this.initializer = initializer;
        this.registerConstructors(initializer);
    }

    async deserialize({input}: { input: SerializationResult }) {
        for (let object of input.objects) {
            this.objectByRef.set(object.$id, object);
        }

        debugger;
    }

    private inflateObject({input}: { input: SerializedObjectRef }) {

    }

    private registerConstructors(constructor: Constructor) {
        if (this.constructors.has(this.getLabel(constructor))) {
            return;
        }

        this.registerConstructor(constructor);

        let dependencies = constructor[dependenciesSymbol];
        if (dependencies) {
            for (let dependency of dependencies) {
                this.registerConstructors(dependency);
            }
        }
    }

    private registerConstructor(constructor: Constructor) {
        console.log(constructor);

        let label = this.getLabel(constructor);
        this.constructors.set(label, constructor);
    }

    private getLabel(constructor: Constructor): string {
        return constructor[labelSymbol];
    }
}