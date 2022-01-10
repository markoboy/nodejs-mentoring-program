import { ValidationException } from '@common/exceptions';
import Joi from 'joi';
import { groupSchema, IGroupPermission } from '../entities';

const createGroupSchema = Joi.object<CreateGroupDTO, true>({
    name: groupSchema.$_reach(['name']) as Joi.StringSchema,
    permissions: groupSchema.$_reach(['permissions']) as Joi.ArraySchema
});

export class CreateGroupDTO {
    readonly name: string;

    readonly permissions: Array<IGroupPermission>;

    constructor({ name, permissions }: CreateGroupDTO) {
        this.name = name;
        this.permissions = permissions;
    }

    public static async from(body: Partial<CreateGroupDTO>): Promise<CreateGroupDTO> {
        try {
            const validatedBody: CreateGroupDTO = await createGroupSchema.validateAsync(body);

            return new CreateGroupDTO(validatedBody);
        } catch (error) {
            throw new ValidationException((error as Error).message);
        }
    }
}
