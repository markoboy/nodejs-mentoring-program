export class Exception extends Error {
    name = 'Exception';

    constructor(message = 'An error occurred') {
        super(message);
    }
}
