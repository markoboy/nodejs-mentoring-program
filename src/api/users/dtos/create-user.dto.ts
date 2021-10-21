import { ValidationException } from '@common/exceptions';
import Joi from 'joi';
import { userAgeValidation, userLoginValidation, userPasswordMessages, userPasswordValidation } from '../entities';

const createUserSchema = Joi.object<CreateUserDTO, true>({
    login: userLoginValidation.required(),

    password: userPasswordValidation.required().messages(userPasswordMessages),

    age: userAgeValidation.required()
});

export class CreateUserDTO {
    public readonly login: string;

    public readonly password: string;

    public readonly age: number;

    constructor({ login, password, age }: CreateUserDTO) {
        this.login = login;
        this.password = password;
        this.age = age;
    }

    public static async from(body: Partial<CreateUserDTO>): Promise<CreateUserDTO> {
        try {
            const validatedBody: CreateUserDTO = await createUserSchema.validateAsync(body);

            return new CreateUserDTO(validatedBody);
        } catch (error) {
            throw new ValidationException((error as Error).message);
        }
    }
}
