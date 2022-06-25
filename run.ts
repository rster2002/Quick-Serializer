import Serializable from "./src/decorators/Serializable";
import Serializer from "./src/classes/Serializer";
let d = {};

@Serializable("i", () => [Cat])
class Person {
    name: string;
    pet: Cat;
    obj = {
        i: 10,
        a: {b: 20, d},
        d,
    };
    arr = []

    constructor(name: string) {
        this.name = name;
    }
}

// @Serializable("Cat", () => [Person])
class Cat {
    owner: Person;
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

//@ts-ignore
window.Person = Person;

let serializer = new Serializer();

let person = new Person("Alice");
let cat = new Cat("Sammie");
person.pet = cat;
cat.owner = person;

person.arr.push(new Person("hi"));

serializer.serialize(person).then(s => {
    serializer.deserialize(Person, s).then(d => {
        console.log(d);
        console.log(serializer);
    });
});
