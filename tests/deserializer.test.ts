//@ts-nocheck

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

let serialized;
beforeEach(() => {
    let mom = new Person();
    let dad = new Person();

    let pet = new Cat("Sammie");

    mom.pet = pet;
    dad.pet = pet;

    mom.image = new File(["mom"], "mom.txt");
    dad.image = new File(["dad"], "dad.txt");


});