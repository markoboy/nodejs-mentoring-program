export class Exception extends Error {
    constructor(message = 'An error occurred') {
        super(message);
    }
}
