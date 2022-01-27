import { BaseEntity, IBaseEntity } from '@common/entities';
import { ValidationException } from '@common/exceptions';
import Joi from 'joi';

export type HashUserPassword = (password: string) => Promise<string> | string;

export interface IUserEntity extends IBaseEntity {
    login: string;

    password: string;

    age: number;

    isDeleted: boolean;
}

export const userLoginValidation = Joi.string();

export const userPasswordValidation = Joi.string()
    .pattern(/[a-zA-Z]/)
    .pattern(/[0-9]/);

export const userPasswordMessages = {
    'string.pattern.base': '"password" must contain letters and numbers'
};

export const userAgeValidation = Joi.number().integer().min(4).max(130);

const userSchema = Joi.object<IUserEntity, true>({
    id: Joi.string().required(),

    login: userLoginValidation.required(),

    password: userPasswordValidation.required().messages(userPasswordMessages),

    age: userAgeValidation.required(),

    isDeleted: Joi.boolean().required()
});

export class UserEntity extends BaseEntity implements IUserEntity {
    readonly login: string;

    readonly password: string;

    readonly age: number;

    readonly isDeleted: boolean;

    protected constructor({ id, login, password, age, isDeleted }: IUserEntity) {
        super({ id });

        this.login = login;
        this.password = password;
        this.age = age;
        this.isDeleted = isDeleted;
    }

    static async create(user: Partial<IUserEntity>, hashUserPassword?: HashUserPassword): Promise<UserEntity> {
        if (hashUserPassword && user.password) {
            try {
                user.password = await Promise.resolve(hashUserPassword(user.password));
            } catch (error) {
                throw new ValidationException('An error occurred to create a user');
            }
        }

        try {
            if (!user.id) {
                user.id = this.generateUUID();
                user.isDeleted = false;
            }

            const validatedUser: IUserEntity = await userSchema.validateAsync(user);
            return new UserEntity(validatedUser);
        } catch (error) {
            throw new ValidationException((error as Error).message);
        }
    }
}
