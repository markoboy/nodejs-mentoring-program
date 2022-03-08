import { ValidationException } from '@common/exceptions';
import Joi from 'joi';
import { userAgeValidation, userLoginValidation, userPasswordMessages, userPasswordValidation } from '../entities';

const updateUserSchema = Joi.object<UpdateUserDTO, true>()
    .keys({
        login: userLoginValidation.optional(),

        password: userPasswordValidation.optional().messages(userPasswordMessages),

        age: userAgeValidation.optional()
    })
    .required()
    .min(1);

export class UpdateUserDTO {
    public readonly login?: string;

    public readonly password?: string;

    public readonly age?: number;

    constructor({ login, password, age }: UpdateUserDTO) {
        this.login = login;
        this.password = password;
        this.age = age;
    }

    public static async from(body: Partial<UpdateUserDTO>): Promise<UpdateUserDTO> {
        try {
            const validatedBody: UpdateUserDTO = await updateUserSchema.validateAsync(body);

            return new UpdateUserDTO(validatedBody);
        } catch (error) {
            throw new ValidationException((error as Error).message);
        }
    }
}
