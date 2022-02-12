import { ValidationException } from '@common/exceptions';
import Joi from 'joi';
import { userLoginValidation, userPasswordMessages, userPasswordValidation } from '../entities';

const createUserSchema = Joi.object<LoginUserDTO, true>({
    login: userLoginValidation.required(),

    password: userPasswordValidation.required().messages(userPasswordMessages)
});

export class LoginUserDTO {
    public readonly login: string;

    public readonly password: string;

    private constructor({ login, password }: LoginUserDTO) {
        this.login = login;
        this.password = password;
    }

    public static async from(body: Partial<LoginUserDTO>): Promise<LoginUserDTO> {
        try {
            const validatedBody: LoginUserDTO = await createUserSchema.validateAsync(body);

            return new LoginUserDTO(validatedBody);
        } catch (error) {
            throw new ValidationException((error as Error).message);
        }
    }
}
