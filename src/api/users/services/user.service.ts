import { Inject, Provider } from '@common/decorators';
import { IDatabaseDriver } from '@common/drivers';
import { NotFoundException, BadRequestException } from '@common/exceptions';
import { IBaseRepository } from '@common/repositories';
import { CORE_TYPES } from '@core';

import { HashService } from '.';
import { IUserEntity, UserEntity } from '../entities';

export type IUserSafe = Omit<Required<IUserEntity>, 'password'> & {
    password?: null;
};

export const USER_REPOSITORY_MODEL = 'user';

@Provider()
export class UserService {
    private readonly userRepository: IBaseRepository<UserEntity>;

    constructor(@Inject(CORE_TYPES.DatabaseDriver) databaseDriver: IDatabaseDriver, private hashService: HashService) {
        this.userRepository = databaseDriver.getRepository<UserEntity>(USER_REPOSITORY_MODEL);
    }

    async findById(id: string): Promise<IUserSafe> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundException(`User with id: ${id} was not found`);
        }

        return UserService.getSafeUser(user);
    }

    async create(user: Omit<IUserEntity, 'id' | 'isDeleted'>): Promise<IUserSafe> {
        const existingUser = await this.userRepository.find(
            { login: { value: user.login, exact: true } },
            { limit: 1 }
        );

        if (existingUser.length) {
            throw new BadRequestException(`User with login: ${user.login} already exists`);
        }

        const newUser = await UserEntity.create(user, this.hashService.hash);

        const createdUser = await this.userRepository.create(newUser);

        return UserService.getSafeUser(createdUser);
    }

    async updateOne(id: string, user: Partial<Omit<IUserEntity, 'id'>>): Promise<boolean> {
        const existingUser = await this.userRepository.findById(id);

        if (!existingUser) {
            throw new NotFoundException(`User with id: ${id} was not found`);
        }

        const userEntity = await UserEntity.create(
            {
                ...existingUser,
                ...user
            },
            user.password ? this.hashService.hash : undefined
        );

        return this.userRepository.updateOne(id, userEntity);
    }

    async deleteOne(id: string): Promise<boolean> {
        return this.userRepository.deleteOne(id);
    }

    async getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<IUserSafe[]> {
        return (
            await this.userRepository.find(
                {
                    login: loginSubstring,
                    isDeleted: false
                },
                {
                    limit
                }
            )
        )?.map(UserService.getSafeUser);
    }

    public static getSafeUser(user: UserEntity): IUserSafe {
        return {
            id: user.id,
            age: user.age,
            isDeleted: user.isDeleted,
            login: user.login
        };
    }
}
