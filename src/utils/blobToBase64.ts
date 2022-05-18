export default async function blobToBase64(blob: Blob) {
    let reader = new FileReader();
    reader.readAsDataURL(blob);

    return new Promise(resolve => {
        reader.onload = () => {
            resolve(reader.result);
        };
    });
}