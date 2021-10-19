import { Exception } from '.';

export class ValidationException extends Exception {
    constructor(message = 'A valid input is required') {
        super(message);
    }
}
