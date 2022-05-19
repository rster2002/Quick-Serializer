export default abstract class Plugin {
    abstract getName(): string;
    abstract match(value: unknown): boolean;
    abstract serialize(value: unknown): Promise<unknown>;
    abstract deserialize(value: unknown): Promise<unknown>;
}