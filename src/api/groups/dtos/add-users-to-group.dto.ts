import { ValidationException } from '@common/exceptions';
import Joi from 'joi';

const findOneGroupSchema = Joi.object<AddUsersToGroupDTO, true>({
    userIds: Joi.array().items(Joi.string()).required()
});

export class AddUsersToGroupDTO {
    constructor(public readonly userIds: string[]) {}

    public static async from(body: Partial<AddUsersToGroupDTO>): Promise<AddUsersToGroupDTO> {
        try {
            const { userIds }: AddUsersToGroupDTO = await findOneGroupSchema.validateAsync(body);

            return new AddUsersToGroupDTO(userIds);
        } catch (error) {
            throw new ValidationException((error as Error).message);
        }
    }
}
