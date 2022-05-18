//@ts-nocheck
import Serializable from "../src/decorators/Serializable";
import Ignore from "../src/decorators/Ignore";

@Serializable("Person")
class Person {
    relatives: Person[] = [];
    pet: Pet = null;
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

@Serializable("Cat")
class Cat extends Pet {
    isCute: boolean = true;
    
    constructor(name: string) {
        super(name);
    }
}

test("Empty person is serialized correctly", async () => {
    // Given
    let instance = new Person();
    
    // When
    let serialized = await instance.serialize();
    
    // Then
    expect(serialized).not.toBeUndefined();
    expect(serialized.value).not.toBeUndefined();
    expect(serialized.value.$ref).not.toBeUndefined();
    expect(serialized.objects).toHaveLength(1);
    expect(serialized.objects[0]).toHaveProperty("$id");
    expect(serialized.objects[0]).toHaveProperty("$name");
    expect(serialized.objects[0].$name).toBe("Person");
    expect(serialized.objects[0].relatives).toEqual([]);
    expect(serialized.objects[0].pet).toBe(null);
});

test("Ignored field is not included", async () => {
    // Given
    let instance = new Person();

    // When
    let serialized = await instance.serialize();

    // Then
    expect(serialized.objects[0]).not.toHaveProperty("superSecret");
});

test("Person with relative is serialized correctly", async () => {
    // Given
    let person1 = new Person();
    let person2 = new Person();
    person1.relatives.push(person2);

    // When
    let serialized = await person1.serialize();

    // Then
    expect(serialized).not.toBeUndefined();
    expect(serialized.value).not.toBeUndefined();
    expect(serialized.value.$ref).not.toBeUndefined();
    expect(serialized.objects).toHaveLength(2);
    expect(serialized.objects[1].relatives).toHaveLength(1);
    expect(serialized.objects[1].relatives[0].$ref).toBe(serialized.objects[0].$id);
});

test("Person with two times the same relative is serialized correctly", async () => {
    // Given
    let person1 = new Person();
    let person2 = new Person();
    person1.relatives.push(person2);
    person1.relatives.push(person2);

    // When
    let serialized = await person1.serialize();

    // Then
    expect(serialized).not.toBeUndefined();
    expect(serialized.value).not.toBeUndefined();
    expect(serialized.value.$ref).not.toBeUndefined();
    expect(serialized.objects).toHaveLength(2);
    expect(serialized.objects[1].relatives).toHaveLength(2);
    expect(serialized.objects[1].relatives[0].$ref).toBe(serialized.objects[0].$id);
    expect(serialized.objects[1].relatives[1].$ref).toBe(serialized.objects[0].$id);
});

test("Person with cat is serialized correctly", async () => {
    // Given
    let person = new Person();
    person.pet = new Cat("Sammie");

    // When
    let serialized = await person.serialize();

    // Then
    expect(serialized).not.toBeUndefined();
    expect(serialized.value).not.toBeUndefined();
    expect(serialized.value.$ref).not.toBeUndefined();
    expect(serialized.objects).toHaveLength(2);
    expect(serialized.objects[0].$name).toBe("Cat");
    expect(serialized.objects[0].isCute).toBe(true);
    expect(serialized.objects[1].pet).not.toBeNull();
});

test("A blob is serialized correctly", async () => {
    // Given
    let person = new Person();
    person.image = new File(["abc"], "test.txt");

    // When
    let serialized = await person.serialize();
    expect(serialized.objects).toHaveLength(1);
    expect(serialized.objects[0].image).toBe("data:application/octet-stream;base64,YWJj");
});