import { ValidationException } from '@common/exceptions';
import Joi from 'joi';

const getSuggestedUsersSchema = Joi.object<GetSuggestedUsersDTO, true>({
    loginSubstring: Joi.string().required(),

    limit: Joi.number().integer().min(1).max(130).optional()
});

export class GetSuggestedUsersDTO {
    public readonly loginSubstring: string;

    public readonly limit: number;

    constructor({ loginSubstring, limit }: GetSuggestedUsersDTO) {
        this.loginSubstring = loginSubstring;
        this.limit = limit ?? 10;
    }

    public static async from(body: Partial<GetSuggestedUsersDTO>): Promise<GetSuggestedUsersDTO> {
        try {
            const validatedBody: GetSuggestedUsersDTO = await getSuggestedUsersSchema.validateAsync(body);

            return new GetSuggestedUsersDTO(validatedBody);
        } catch (error) {
            throw new ValidationException((error as Error).message);
        }
    }
}
