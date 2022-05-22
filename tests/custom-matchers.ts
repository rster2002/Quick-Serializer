import { expect } from "@jest/globals";

interface CustomResult {
    pass: boolean
    message: () => string
}

//@ts-ignore
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeRef(): CustomResult
        }
    }
}

expect.extend({
    toBeRef(ref: object): CustomResult {
        if (Object.keys(ref).length !== 1) {
            return fail(`Expected a ref, but found an object with more than one key`);
        }

        if (ref["$ref"] === undefined) {
            return fail(`Ref does not contain the $ref key`);
        }

        return pass();
    }
});

function pass(message: string = "Passed"): CustomResult {
    return {
        pass: true,
        message: () => message,
    }
}

function fail(message: string = "Failed"): CustomResult {
    return {
        pass: false,
        message: () => message,
    }
}