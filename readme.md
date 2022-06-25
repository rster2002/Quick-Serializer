# Quick serializer

Quick serializer is a library that allows you to quickly serialize and deserialize classes to and from JSON representations. This
JSON can then be stored somewhere like localstorage.

## Installation

To install quick serializer use NPM:

```bash
npm install quick-serializer
```

## Usage

To get started, add the `Serializable` decorator to the class you want to serialize:

```ts
import { Serializable } from "quick-serializer";

@Serializable("Person")
class Person {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}
```

You need to give it a name and make sure it's unique. You can then serialize it to JSON using the serializer:

```ts
import { Serializer } from "quick-serializer";

let person = new Person();

let serializer = new Serializer();
let json = await serializer.serialize(person);
```

To then deserialize it back to class objects, you need to pass the class constructor along with the JSON:

```ts
import { Serializer } from "quick-serializer";

let serializer = new Serializer();
let deserializedPerson = await serializer.deserialize(Person, person);
```

## Nested classes and inheritance

Usually classes have objects from other classes attached to them, and they might also inherit from other classes. For
example:

```ts
class Person {
    name: string;
    pet: Pet;

    constructor(name: string) {
        this.name = name;
    }
}

class Pet {
    name: string;
    owner: Person;
}

class Cat extends Pet {
    isCute: boolean;
}
```

In this case we will first add the `Serializable` decorator to all classes, but in addition to the label we also add the
dependencies of that class:

```ts
import { Serializable } from "quick-serializer";

@Serializable("Person", () => [Pet])
class Person {
    name: string;
    pet: Pet;

    constructor(name: string) {
        this.name = name;
    }
}

@Serializable("Pet", () => [Person])
class Pet {
    name: string;
    owner: Person;
}

@Serializable("Cat")
class Cat extends Pet {
    isCute: boolean;
}
```

This way, quick serializer knows where to find the classes it needs when it's deserializing back from JSON.
