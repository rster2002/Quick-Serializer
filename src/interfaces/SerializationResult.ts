import type SerializedObject from "./SerializedObject";
import type SerializedObjectRef from "./SerializedObjectRef";

export default interface SerializationResult {
    objects: SerializedObject[]
    value: SerializedObjectRef
}