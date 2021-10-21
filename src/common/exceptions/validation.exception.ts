import { Exception } from '.';

export class ValidationException extends Exception {
    name = 'Validation';

    constructor(message = 'A valid input is required') {
        super(message);
    }
}
