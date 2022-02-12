import jwt from 'jsonwebtoken';

import { Inject, Provider } from '@common/decorators';
import { Exception, UnauthorizedException } from '@common/exceptions';
import { IBaseRepository } from '@common/repositories';
import { Environment } from '@config';
import { USER_REPOSITORY_MODEL } from '@constants';
import { CORE_INTERFACES, CORE_TYPES } from '@core';

import { UserEntity } from '../entities';
import { HashService } from './hash.service';

export interface IAuthCredentials {
    login: string;
    password: string;
}

type JWTParameters = Parameters<typeof jwt.sign>;

function jwtSign(
    payload: JWTParameters[0],
    secretOrPrivateKey: JWTParameters[1],
    options: JWTParameters[2]
): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secretOrPrivateKey, options, (err, token) => {
            if (err || !token) {
                return reject(err);
            }

            resolve(token);
        });
    });
}

@Provider()
export class AuthService {
    private readonly userRepository: IBaseRepository<UserEntity>;

    constructor(
        @Inject(CORE_TYPES.DatabaseDriver) databaseDriver: CORE_INTERFACES.DatabaseDriver,
        @Inject(CORE_TYPES.Logger) private logger: CORE_INTERFACES.Logger,
        private hashService: HashService
    ) {
        this.userRepository = databaseDriver.getRepository<UserEntity>(USER_REPOSITORY_MODEL);
    }

    async signJWTToken({ login, password }: IAuthCredentials): Promise<string> {
        const user = (await this.userRepository.find({ login: { value: login, exact: true } }, { limit: 1 }))[0];

        if (!user) {
            throw new UnauthorizedException('No user was found with the given login, password combination.');
        }

        const isValid = await this.hashService.verify(password, user.password);

        if (!isValid) {
            throw new UnauthorizedException('No user was found with the given login, password combination.');
        }

        const { secret, expires } = Environment.get('jwt');

        try {
            return await jwtSign({ id: user.id }, secret, { expiresIn: expires });
        } catch (error) {
            this.logger.error('JWT Token could not be created', Object.assign(error, { id: user.id, expires }));
            throw new Exception("We couldn't sign you in. Please try again later.");
        }
    }

    async verifyJWTToken(): Promise<void> {
        console.log('Token verified');
    }
}
