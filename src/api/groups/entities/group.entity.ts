import Joi from 'joi';

import { BaseEntity, IBaseEntity } from '@common/entities';
import { ValidationException } from '@common/exceptions';

import { validPermissions, IPermission } from './permission.entity';

export interface IGroupEntity extends IBaseEntity {
    name: string;

    permissions: Array<IPermission>;
}

export const groupSchema = Joi.object<IGroupEntity, true>({
    id: Joi.string().required(),

    name: Joi.string().required(),

    permissions: Joi.array()
        .items(Joi.string().valid(...validPermissions))
        .required()
});

export class GroupEntity extends BaseEntity implements IGroupEntity {
    readonly name: string;

    readonly permissions: Array<IPermission>;

    protected constructor({ id, name, permissions }: IGroupEntity) {
        super({ id });

        this.name = name;
        this.permissions = permissions;
    }

    static async create(group: Partial<IGroupEntity>): Promise<GroupEntity> {
        try {
            if (!group.id) {
                group.id = this.generateUUID();
            }

            const validatedGroup: IGroupEntity = await groupSchema.validateAsync(group);

            return new GroupEntity(validatedGroup);
        } catch (error) {
            throw new ValidationException((error as Error).message);
        }
    }
}
