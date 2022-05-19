export default abstract class Plugin {
    abstract match(value: unknown): boolean;
    abstract serialize(value: unknown): unknown;
}