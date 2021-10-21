import { ValidationException } from '@common/exceptions';
import Joi from 'joi';

const findOneUserSchema = Joi.object<FindOneUserDTO, true>({
    id: Joi.string().required()
});

export class FindOneUserDTO {
    constructor(public readonly id: string) {}

    public static async from(body: Partial<FindOneUserDTO>): Promise<FindOneUserDTO> {
        try {
            const { id }: FindOneUserDTO = await findOneUserSchema.validateAsync(body);

            return new FindOneUserDTO(id);
        } catch (error) {
            throw new ValidationException((error as Error).message);
        }
    }
}
