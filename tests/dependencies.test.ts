import Serializable from "../src/decorators/Serializable";
import { dependenciesSymbol } from "../src/symbols";

class Dep {}
class Dep2 {}

test("Dependencies are added to class constructor", () => {
    // When
    @Serializable("A", [Dep])
    class A {}
    
    // Then
    expect(A[dependenciesSymbol]).toEqual([Dep]);
});

test("Dependencies available in child class constructor", () => {
    // When
    @Serializable("A", [Dep])
    class A {}
    class B extends A {}

    // Then
    expect(B[dependenciesSymbol]).toEqual([Dep]);
});

test("Dependencies of child constructors are merged with parent constructor", () => {
    // When
    @Serializable("A", [Dep])
    class A {}
    @Serializable("B", [Dep2])
    class B extends A {}

    // Then
    expect(B[dependenciesSymbol]).toEqual([Dep2, Dep]);
});

test("Dependencies of child constructors are merged with grand parent constructor", () => {
    // When
    @Serializable("A", [Dep])
    class A {}
    class B extends A {}
    @Serializable("C", [Dep2])
    class C extends B {}

    // Then
    expect(C[dependenciesSymbol]).toEqual([Dep2, Dep]);
});

test("Dependencies of child constructors are merged with grand parent constructor 2", () => {
    // When
    @Serializable("A", [Dep])
    class A {}
    @Serializable("B")
    class B extends A {}
    @Serializable("C", [Dep2])
    class C extends B {}

    // Then
    expect(C[dependenciesSymbol]).toEqual([Dep2, Dep]);
});