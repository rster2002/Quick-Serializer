//@ts-nocheck
import Serializable from "../src/decorators/Serializable";
import Ignore from "../src/decorators/Ignore";
import Serializer from "../src/classes/Serializer";
import Walker from "./Walker";
import "./custom-matchers";

let plainObject = { a: {b: {c: 10}, d: 20}, e: [10, { f: {g: 10} }], h: 10 };

@Serializable("Person")
class Person {
    name: string;
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
    owner: Person;
    
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
    let walker = new Walker(serialized);
    walker.expectBasics();
});

test("Ignored field is not included", async () => {
    // Given
    let instance = new Person();

    // When
    let serialized = await serializer.serialize(instance);

    // Then
    expect(serialized.objects[0]).not.toHaveProperty("superSecret");
});

test("Plain objects are serialized correctly", async () => {
    // Given
    let person = new Person();
    person.plainObject = plainObject;

    // When
    let serialized = await serializer.serialize(person);

    // Then
    let walker = new Walker(serialized);
    walker.expectBasics();

    expect(walker.value().plainObject).toBeRef();

    // { a: {b: {c: 10}, d: 20}, e: [10, { f: {g: 10} }], h: 10 };

    walker.follow(walker.value().plainObject);
    let firstLevel = walker.value();
    expect(firstLevel.a).toBeRef();
    expect(firstLevel.e).toBeRef();
    expect(firstLevel.h).toBe(10);

    walker.follow(firstLevel.a);
    let secondLevel = walker.value();
    expect(secondLevel.b).toBeRef();
    expect(secondLevel.d).toBe(20);

    walker.follow(secondLevel.b);
    let thirdLevel = walker.value();
    expect(thirdLevel.c).toBe(10);

    walker.follow(firstLevel.e);
    let fourthLevel = walker.value();
    expect(fourthLevel[0]).toBe(10);
    expect(fourthLevel[1]).toBeRef();

    walker.follow(fourthLevel[1]);
    let fifthLevel = walker.value();
    expect(fifthLevel.f).toBeRef();

    walker.follow(fifthLevel.f);
    let sixthLevel = walker.value();
    expect(sixthLevel.g).toBe(10);
});

test("Arrays are serialized correctly", async () => {
    // Given
    let person = new Person();

    // When
    let serialized = await serializer.serialize(person);

    // Then
    let walker = new Walker(serialized);
    walker.expectBasics();
    
    expect(walker.value().relatives).toBeRef();

    walker.follow(walker.value().relatives);
    expect(walker.name()).toBe("$array");
    expect(walker.value()).toEqual([]);
});

test("Person with relative is serialized correctly", async () => {
    // Given
    let person1 = new Person();
    let person2 = new Person();
    person2.name = "Person 2";
    person1.relatives.push(person2);

    // When
    let serialized = await serializer.serialize(person1);

    // Then
    expect(serialized).not.toBeUndefined();
    expect(serialized.value).not.toBeUndefined();
    expect(serialized.objects).toHaveLength(4);

    let walker = new Walker(serialized);
    walker.expectBasics();    

    expect(walker.name()).toBe("Person");
    expect(walker.value().relatives).toBeRef();
    
    walker.follow(walker.value().relatives);
    expect(walker.name()).toBe("$array");
    expect(walker.value()).toHaveLength(1);
    expect(walker.value()[0]).toBeRef();

    walker.follow(walker.value()[0]);
    expect(walker.name()).toBe("Person");
    expect(walker.value().name).toBe("Person 2");
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
    let walker = new Walker(serialized);
    walker.expectBasics();    

    walker.follow(walker.value().relatives);
    expect(walker.value()).toHaveLength(2);
    expect(walker.value()[0]).toBeRef();
    expect(walker.value()[1]).toBeRef();
    
    expect(walker.value()[0].$ref).toBe(walker.value()[1].$ref);
});

test("Person with cat is serialized correctly", async () => {
    // Given
    let person = new Person();
    person.pet = new Cat("Sammie");

    // When
    let serialized = await serializer.serialize(person);

    // Then
    let walker = new Walker(serialized);
    walker.expectBasics();    

    expect(walker.value().pet).toBeRef();
    
    walker.follow(walker.value().pet);
    expect(walker.name()).toBe("Cat");
    expect(walker.value().name).toBe("Sammie");
    expect(walker.value().isCute).toBe(true);
});

test("A blob is serialized correctly", async () => {
    // Given
    let person = new Person();
    person.image = new Blob(["abc"]);

    // When
    let serialized = await serializer.serialize(person);

    // Then
    let walker = new Walker(serialized);
    walker.expectBasics();    

    expect(walker.value().image).toBeRef();
    
    walker.follow(walker.value().image);
    expect(walker.name()).toBe("$plugin");
    expect(walker.value()).toEqual({
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
    let walker = new Walker(serialized);
    walker.expectBasics();

    expect(walker.value().image).toBeRef();

    walker.follow(walker.value().image);
    expect(walker.name()).toBe("$plugin");
    expect(walker.value()).toEqual({
        $plugin: "File",
        $value: {
            data: "data:application/octet-stream;base64,YWJj",
            name: "test.txt",
        },
    });
});

test("Circular objects are serialized correctly", async () => {
    // Given
    let person = new Person();
    let cat = new Cat("Sammie");
    
    person.pet = cat;
    cat.owner = person;
    
    // When
    let serialized = await serializer.serialize(person);
    
    // Then
    let walker = new Walker(serialized);
    walker.expectBasics();
    
    let personId = walker.id();
    expect(walker.value().pet).toBeRef();
    let catRef = walker.value().pet.$ref;
    
    walker.follow(walker.value().pet);
    let petId = walker.id();
    expect(walker.value().owner).toBeRef();
    let ownerRef = walker.value().owner.$ref;
    
    expect(ownerRef).toBe(personId);
    expect(catRef).toBe(petId);
});