import { Exception } from '.';

export class NotFoundException extends Exception {
    constructor(message = 'Not found') {
        super(message);
    }
}
