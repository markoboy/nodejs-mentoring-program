import { Exception } from './exception';

export class BadRequestException extends Exception {
    name = 'BadRequest';

    constructor(message = 'Bad request') {
        super(message);
    }
}
