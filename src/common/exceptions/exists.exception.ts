import { Exception } from '.';

export class ExistsException extends Exception {
    name = 'Exists';

    constructor(message = 'Resource already exists') {
        super(message);
    }
}
