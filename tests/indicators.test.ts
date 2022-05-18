import Serializable from "../src/decorators/Serializable";
import { labelSymbol, serializableIndicatorSymbol } from "../src/symbols";

test("Serializable indicator is added to class constructor", () => {
    // When
    @Serializable("A")
    class A {}
    
    // Then
    expect(A[serializableIndicatorSymbol]).toBe(true);
});

test("Serializable indicator is available on child class constructor", () => {
    // Given
    @Serializable("A")
    class A {}
    
    // Then
    class B extends A {}

    // Then
    expect(A[serializableIndicatorSymbol]).toBe(true);
});

test("Label is present on class constructor", () => {
    // When
    @Serializable("A")
    class A {}
    
    // Then
    expect(A[labelSymbol]).toBe("A");
});

test("Label is present on child class constructor", () => {
    // Given
    @Serializable("A")
    class A {}
    
    // When
    class B extends A {}

    // Then
    expect(B[labelSymbol]).toBe("A");
});

test("Serializable child constructor overrides label", () => {
    // Given
    @Serializable("A")
    class A {}

    // Then
    @Serializable("B")
    class B extends A {}


    // Then
    expect(B[labelSymbol]).toBe("B");
});

test("Serializable indicator present on class instances", () => {
    // Given
    @Serializable("A")
    class A {}
    
    // When
    let instance = new A();

    // Then
    expect(instance[serializableIndicatorSymbol]).toBe(true);
});

test("Serializable indicator present on child class instances", () => {
    // Given
    @Serializable("A")
    class A {}
    class B extends A {}

    // When
    let instance = new B();

    // Then
    expect(instance[serializableIndicatorSymbol]).toBe(true);
});

test("Label present on class instances", () => {
    // Given
    @Serializable("A")
    class A {}

    // When
    let instance = new A();

    // Then
    expect(instance[labelSymbol]).toBe("A");
});

test("Label present on child class instances", () => {
    // Given
    @Serializable("A")
    class A {}
    class B extends A {}

    // When
    let instance = new B();

    // Then
    expect(instance[labelSymbol]).toBe("A");
});

test("Label present on child class instances with new serializable label", () => {
    // Given
    @Serializable("A")
    class A {}

    @Serializable("B")
    class B extends A {}

    // Then
    let instance = new B();
    
    // Then
    expect(instance[labelSymbol]).toBe("B");
});