import { Exception } from './exception';

export class NotFoundException extends Exception {
    name = 'NotFound';

    constructor(message = 'Not found') {
        super(message);
    }
}
