import { HttpRequest, IHttpMiddleware } from '@common/controllers';
import { Provider } from '@common/decorators';
import { UnauthorizedException } from '@common/exceptions';
import { AuthService, IUserSafe } from '../services';

export interface IAuthMiddlewareResponse {
    user: IUserSafe;
}

@Provider()
export class AuthMiddleware implements IHttpMiddleware<IAuthMiddlewareResponse> {
    constructor(private readonly authService: AuthService) {}

    async use(request: HttpRequest): Promise<IAuthMiddlewareResponse> {
        const [, token] = request.headers.authorization?.split(' ') ?? [];

        if (!token) {
            throw new UnauthorizedException('You are not authorized for this action.');
        }

        return { user: await this.authService.verifyJWTToken(token) };
    }
}
