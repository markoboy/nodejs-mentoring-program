import { ValidationException } from '@common/exceptions';
import Joi from 'joi';
import { groupSchema, IPermission } from '../entities';

const updateGroupSchema = Joi.object<UpdateGroupDTO, true>({
    name: groupSchema.$_reach(['name']).optional() as Joi.StringSchema,
    permissions: groupSchema.$_reach(['permissions']).optional() as Joi.ArraySchema
});

export class UpdateGroupDTO {
    readonly name?: string;

    readonly permissions?: Array<IPermission>;

    constructor({ name, permissions }: UpdateGroupDTO) {
        this.name = name;
        this.permissions = permissions;
    }

    public static async from(body: Partial<UpdateGroupDTO>): Promise<UpdateGroupDTO> {
        try {
            const validatedBody: UpdateGroupDTO = await updateGroupSchema.validateAsync(body);

            return new UpdateGroupDTO(validatedBody);
        } catch (error) {
            throw new ValidationException((error as Error).message);
        }
    }
}
