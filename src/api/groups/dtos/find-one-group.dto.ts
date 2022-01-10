import { ValidationException } from '@common/exceptions';
import Joi from 'joi';

const findOneGroupSchema = Joi.object<FindOneGroupDTO, true>({
    id: Joi.string().required()
});

export class FindOneGroupDTO {
    constructor(public readonly id: string) {}

    public static async from(body: Partial<FindOneGroupDTO>): Promise<FindOneGroupDTO> {
        try {
            const { id }: FindOneGroupDTO = await findOneGroupSchema.validateAsync(body);

            return new FindOneGroupDTO(id);
        } catch (error) {
            throw new ValidationException((error as Error).message);
        }
    }
}
