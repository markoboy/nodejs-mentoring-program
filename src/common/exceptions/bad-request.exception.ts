import { Exception } from '.';

export class BadRequestException extends Exception {
    name = 'BadRequest';

    constructor(message = 'Bad request') {
        super(message);
    }
}
