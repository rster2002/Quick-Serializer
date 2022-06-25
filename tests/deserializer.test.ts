//@ts-nocheck

import Serializable from "../src/decorators/Serializable";
import Ignore from "../src/decorators/Ignore";
import Serializer from "../src/classes/Serializer";

@Serializable("Person", () => [Pet])
class Person {
    name: string;
    relatives: Person[] = [];
    pet: Pet = null
    image: Blob;

    @Ignore
    superSecret: string = "Shh";
}

@Serializable("Pet")
class Pet {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

@Serializable("Cat", () => [Person])
class Cat extends Pet {
    isCute: boolean = true;

    constructor(name: string) {
        super(name);
    }
}

let serializer;
beforeEach(() => {
    serializer = new Serializer();
});

test("Can correctly deserialize a single object correctly", async () => {
    // Given
    let person = new Person();
    person.name = "Alice";

    let serialized = await serializer.serialize(person);

    // When
    let deserialized = await serializer.deserialize(Person, serialized);

    // Then
    expect(deserialized).toBeInstanceOf(Person);
    expect(deserialized.name).toBe("Alice");
    expect(deserialized.relatives).toEqual([]);
    expect(deserialized.pet).toBeNull();
    expect(deserialized.image).toBeUndefined();
});

test("Nested classes are deserialized correctly", async () => {
    // Given
    let person = new Person();
    person.name = "Alice";
    person.pet = new Cat("Sammie");

    let serialized = await serializer.serialize(person);

    // When
    let deserialized = await serializer.deserialize(Person, serialized);

    // Then
    expect(deserialized).toBeInstanceOf(Person);
    expect(deserialized.name).toBe("Alice");
    expect(deserialized.relatives).toEqual([]);
    expect(deserialized.image).toBeUndefined();
    expect(deserialized.pet).toBeInstanceOf(Cat);
    expect(deserialized.pet.name).toBe("Sammie");
});
