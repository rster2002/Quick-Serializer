interface Person {
    name: string
}

function greet(person: Person) {
    console.log(`Hello ${person.name}`);
}

greet({
    name: "Alice",
});