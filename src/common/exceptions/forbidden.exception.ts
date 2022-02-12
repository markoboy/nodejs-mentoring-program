import { Exception } from './exception';

export class ForbiddenException extends Exception {
    name = 'Forbidden';

    constructor(message = 'Forbidden') {
        super(message);
    }
}
