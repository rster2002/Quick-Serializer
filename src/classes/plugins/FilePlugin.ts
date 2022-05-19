import Plugin from "../Plugin";
import blobToBase64 from "../../utils/blobToBase64";

interface SerializedFile {
    name: string
    data: string
}

export default class FilePlugin extends Plugin {
    getName(): string {
        return "File";
    }

    match(value: unknown): boolean {
        return value instanceof File;
    }

    async serialize(value: File): Promise<unknown> {
        return {
            name: value.name,
            data: await blobToBase64(value),
        };
    }
    
    async deserialize(value: SerializedFile) {
        return new File(["hi"], value.name);
    }
}