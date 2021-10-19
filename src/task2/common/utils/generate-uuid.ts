export function generateUUID(): string {
    const S4 = (): string =>
        Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);

    return S4().repeat(8).toLocaleLowerCase();
}
