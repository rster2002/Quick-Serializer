import SerializationResult from "../src/interfaces/SerializationResult";
import SerializedObject from "../src/interfaces/SerializedObject";
import SerializedObjectRef from "../src/interfaces/SerializedObjectRef";

export default class Walker {
    private serialized: SerializationResult;
    private currentObject: SerializedObject;

    constructor(serialized: SerializationResult) {
        this.serialized = serialized;
        
        this.follow(serialized.value);
    }
    
    expectBasics() {
        expect(this.serialized).not.toBeUndefined();
        expect(this.serialized).not.toBeNull();
        expect(this.serialized.value).not.toBeUndefined();

        for (let obj of this.serialized.objects) {
            expect(obj).toHaveProperty("$id");
            expect(obj.$id).not.toBeUndefined();
            expect(obj.$id).not.toBeNull();
            
            expect(obj).toHaveProperty("$name");
            expect(obj.$name).not.toBeUndefined();
            expect(obj.$name).not.toBeNull();
            
            expect(obj).toHaveProperty("$value");
        }
    }

    follow(ref: SerializedObjectRef): SerializedObject {
        expect(ref).not.toBeUndefined();
        expect(ref).not.toBeNull();
        expect(ref).toHaveProperty("$ref");

        let object = this.serialized.objects.find(object => object.$id === ref.$ref);
        return this.currentObject = object ?? null;
    }
    
    raw() {
        return this.currentObject;
    }
    
    value() {
        return this.currentObject.$value;
    }
    
    name() {
        return this.currentObject.$name;
    }
    
    id() {
        return this.currentObject.$id;
    }
}