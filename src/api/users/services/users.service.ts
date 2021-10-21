import { injectable, inject } from 'inversify';

import { ExistsException } from '@common/exceptions/exists.exception';
import { NotFoundException } from '@common/exceptions/not-found.exception';
import { IBaseRepository } from '@common/repositories';

import { HashService } from '.';
import { IUserEntity, UserEntity } from '../entities';
import { USER_TYPES } from '../user.ioc';

export type IUserSafe = Omit<Required<IUserEntity>, 'password'> & {
    password?: null;
};

export interface IUserRepository extends IBaseRepository<UserEntity> {
    getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<UserEntity[]>;
}

@injectable()
export class UserService {
    constructor(
        @inject(USER_TYPES.UserRepository) private userRepository: IUserRepository,
        private hashService: HashService
    ) {}

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
            throw new ExistsException(`User with login: ${user.login} already exists`);
        }

        const newUser = await UserEntity.create(user, this.hashService.hash);

        const savedUser = await this.userRepository.save(newUser);

        return UserService.getSafeUser(savedUser);
    }

    async updateOne(id: string, user: Partial<Omit<IUserEntity, 'id'>>): Promise<IUserSafe> {
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

        const updatedUser = await this.userRepository.updateOne(id, userEntity);

        if (!updatedUser) {
            throw new NotFoundException(`User with id: ${id} could not be updated`);
        }

        return UserService.getSafeUser(updatedUser);
    }

    async deleteOne(id: string): Promise<IUserSafe> {
        const deletedUser = await this.userRepository.deleteOne(id);

        if (!deletedUser) {
            throw new NotFoundException(`User with id: ${id} was not found`);
        }

        return UserService.getSafeUser(deletedUser);
    }

    async getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<IUserSafe[]> {
        const users = await this.userRepository.getAutoSuggestUsers(loginSubstring, limit);

        return users.map(UserService.getSafeUser);
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
