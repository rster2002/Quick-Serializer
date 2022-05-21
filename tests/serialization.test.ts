//@ts-nocheck
import Serializable from "../src/decorators/Serializable";
import Ignore from "../src/decorators/Ignore";
import Serializer from "../src/classes/Serializer";
import Walker from "./Walker";

let plainObject = {};

@Serializable("Person")
class Person {
    relatives: Person[] = [];
    pet: Pet = null;
    image: Blob;
    plainObject: object;
    
    @Ignore
    superSecret: string = "Shh"
}

@Serializable("Pet")
class Pet {
    name: string;
    
    constructor(name: string) {
        this.name = name;
    }
}

@Serializable("Cat")
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

test("Empty person is serialized correctly", async () => {
    // Given
    let instance = new Person();
    
    // When
    let serialized = await serializer.serialize(instance);
    
    // Then
    expect(serialized).not.toBeUndefined();
    expect(serialized.value).not.toBeUndefined();
    expect(serialized.value.$ref).not.toBeUndefined();
    expect(serialized.objects).toHaveLength(2);
    expect(serialized.objects[0]).toHaveProperty("$id");
    expect(serialized.objects[0]).toHaveProperty("$name");
    expect(serialized.objects[0].$name).toBe("Person");
    expect(serialized.objects[0].$value).not.toBeUndefined();
    expect(serialized.objects[0].$value.relatives).toHaveProperty("$ref");
    expect(serialized.objects[0].$value.pet).toBe(null);
});

test("Ignored field is not included", async () => {
    // Given
    let instance = new Person();

    // When
    let serialized = await serializer.serialize(instance);

    // Then
    expect(serialized.objects[0]).not.toHaveProperty("superSecret");
});

test("Person with relative is serialized correctly", async () => {
    // Given
    let person1 = new Person();
    let person2 = new Person();
    person1.relatives.push(person2);

    // When
    let serialized = await serializer.serialize(person1);

    // Then
    expect(serialized).not.toBeUndefined();
    expect(serialized.value).not.toBeUndefined();
    expect(serialized.objects).toHaveLength(4);

    let walker = new Walker(serialized);
    let serializedPerson = walker.follow(serialized.value);
    
    expect(serializedPerson.$value.relatives).toBeRef();

    // expect(serialized.value.$ref).not.toBeUndefined();
    // expect(serialized.objects).toHaveLength(4);
    // expect(serialized.objects[0].$value.relatives).toHaveProperty("$ref");
    // expect(serialized.objects[1].$value).toHaveLength(1);
    // expect(serialized.objects[1].$value[0]).toHaveProperty("$ref");
    // expect(serialized.objects[2].$id).toBe(serialized.objects[1].$value[0].$ref);
});

test("Person with two times the same relative is serialized correctly", async () => {
    // Given
    let person1 = new Person();
    let person2 = new Person();
    person1.relatives.push(person2);
    person1.relatives.push(person2);

    // When
    let serialized = await serializer.serialize(person1);

    // Then
    expect(serialized).not.toBeUndefined();
    expect(serialized.value).not.toBeUndefined();
    expect(serialized.value.$ref).not.toBeUndefined();
    expect(serialized.objects).toHaveLength(4);
    expect(serialized.objects[1].$value).toHaveLength(2);
    expect(serialized.objects[1].$value[0].$ref).toBe(serialized.objects[2].$id);
    expect(serialized.objects[1].$value[1].$ref).toBe(serialized.objects[2].$id);
});

test("Person with cat is serialized correctly", async () => {
    // Given
    let person = new Person();
    person.pet = new Cat("Sammie");

    // When
    let serialized = await serializer.serialize(person);

    // Then
    expect(serialized).not.toBeUndefined();
    expect(serialized.value).not.toBeUndefined();
    expect(serialized.value.$ref).not.toBeUndefined();
    expect(serialized.objects).toHaveLength(3);
    expect(serialized.objects[2].$name).toBe("Cat");
    expect(serialized.objects[2].$value.isCute).toBe(true);
    expect(serialized.objects[0].$value.pet).not.toBeNull();
});

test("A blob is serialized correctly", async () => {
    // Given
    let person = new Person();
    person.image = new Blob(["abc"]);

    // When
    let serialized = await serializer.serialize(person);

    // Then
    expect(serialized.objects).toHaveLength(2);
    expect(serialized.objects[0].$value.image).toEqual({
        $plugin: "Blob",
        $value: {
            data: "data:application/octet-stream;base64,YWJj",
        },
    });
});

test("A file is serialized correctly", async () => {
    // Given
    let person = new Person();
    person.image = new File(["abc"], "test.txt");

    // When
    let serialized = await serializer.serialize(person);

    // Then
    expect(serialized.objects).toHaveLength(2);
    expect(serialized.objects[0].$value.image).toEqual({
        $plugin: "File",
        $value: {
            name: "test.txt",
            data: "data:application/octet-stream;base64,YWJj",
        },
    });
});

test("Plain objects are serialized correctly", async () => {
    // Given
    let person = new Person();
    person.plainObject = plainObject;
    
    let person2 = new Person();
    person2.relatives.push(person);
    
    // When
    let serialized = await serializer.serialize(person2);
    
    // Then
    expect(serialized.objects).toHaveLength(5);
    expect(serialized.objects[2].$value.plainObject).toHaveProperty("$ref");
    expect(serialized.objects[2].$value.plainObject.$ref).toBe(serialized.objects[4].$id);
});

test("Arrays are serialized correctly", async () => {
    // Given
    let person = new Person();
    
    // When
    let serialized = await serializer.serialize(person);
    
    // Then
    expect(serialized.objects).toHaveLength(2);
    expect(serialized.objects[1].$value).toEqual([]);
});