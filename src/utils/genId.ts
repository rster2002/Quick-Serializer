function randomString(characters: string, length: number): string {
    let returnString = "";

    for (let i = 0; i < length; i++) {
        let r = Math.floor(Math.random() * characters.length);
        returnString += characters[r];
    }

    return returnString;
}

export function genId(length = 9): string {
    return randomString(
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        length
    );
}