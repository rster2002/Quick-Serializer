import SerializationResult from "../src/interfaces/SerializationResult";
import SerializedObject from "../src/interfaces/SerializedObject";
import SerializedObjectRef from "../src/interfaces/SerializedObjectRef";

export default class Walker {
    private serialized: SerializationResult;

    constructor(serialized: SerializationResult) {
        this.serialized = serialized;
    }

    follow(ref: SerializedObjectRef): SerializedObject {
        expect(ref).not.toBeUndefined();
        expect(ref).not.toBeNull();
        expect(ref).toHaveProperty("$ref");

        let object = this.serialized.objects.find(object => object.$id === ref.$ref);
        return object ?? null;
    }
}