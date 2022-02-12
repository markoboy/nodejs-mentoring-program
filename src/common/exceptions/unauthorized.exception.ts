import { Exception } from './exception';

export class UnauthorizedException extends Exception {
    name = 'Unauthorized';

    constructor(message = 'Unauthorized') {
        super(message);
    }
}
