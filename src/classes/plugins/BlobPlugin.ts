import Plugin from "../Plugin";
import blobToBase64 from "../../utils/blobToBase64";

export default class BlobPlugin extends Plugin {
    getName(): string {
        return "Blob";
    }

    match(value: unknown): boolean {
        return value instanceof Blob;
    }

    async serialize(value: Blob): Promise<unknown> {
        return {
            data: await blobToBase64(value),
        };
    }

    async deserialize(value: unknown): Promise<unknown> {
        return Promise.resolve(undefined);
    }
}