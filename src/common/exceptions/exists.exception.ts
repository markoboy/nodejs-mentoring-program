import { Exception } from '.';

export class ExistsException extends Exception {
    constructor(message = 'Resource already exists') {
        super(message);
    }
}
