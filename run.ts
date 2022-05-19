import Serializable from "./src/decorators/Serializable";
import Serializer from "./src/classes/Serializer";
let d = {};

@Serializable("i")
class Person {
    name: string;
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

let serializer = new Serializer();

let person = new Person("Alice");

serializer.serialize(person).then(console.log);