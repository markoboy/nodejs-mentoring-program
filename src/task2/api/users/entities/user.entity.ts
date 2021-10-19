import { BaseEntity, IBaseEntity } from '@common/entities';
import { ValidationException } from '@common/exceptions';
import Joi from 'joi';

export type HashUserPassword = (password: string) => Promise<string> | string;

export interface IUserEntity extends Partial<IBaseEntity> {
    login: string;

    password: string;

    age: number;
}

const userSchema = Joi.object<IUserEntity, true>({
    id: Joi.string().required(),

    login: Joi.string().required(),

    password: Joi.string()
        .pattern(/[a-zA-Z]/)
        .pattern(/[0-9]/)
        .required()
        .messages({
            'string.pattern.base': '"password" must contain letters and numbers'
        }),

    age: Joi.number().integer().min(4).max(130).required(),

    isDeleted: Joi.boolean().required()
});

export class UserEntity extends BaseEntity implements IUserEntity {
    readonly login: string;

    readonly password: string;

    readonly age: number;

    protected constructor({ id, login, password, age, isDeleted }: IUserEntity) {
        super({ id, isDeleted });

        this.login = login;
        this.password = password;
        this.age = age;
    }

    static async create(user: IUserEntity, hashUserPassword?: HashUserPassword): Promise<UserEntity> {
        if (hashUserPassword) {
            try {
                user.password = await Promise.resolve(hashUserPassword(user.password));
            } catch (error) {
                throw new ValidationException('An error occurred to create a user');
            }
        }

        const userEntity = new UserEntity(user);

        try {
            await userSchema.validateAsync(userEntity);
        } catch (error) {
            throw new ValidationException((error as Error).message);
        }

        return userEntity;
    }
}
