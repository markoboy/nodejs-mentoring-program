import Joi from 'joi';

import { BaseEntity, IBaseEntity } from '@common/entities';
import { ValidationException } from '@common/exceptions';

import * as GroupPermission from '../constants/group-permissions';

type IGroupPermissionKeys = keyof typeof GroupPermission;

export type IGroupPermission = typeof GroupPermission[IGroupPermissionKeys];

export interface IGroupEntity extends IBaseEntity {
    name: string;

    permissions: Array<IGroupPermission>;
}

const validPermissions = (Object.keys(GroupPermission) as Array<IGroupPermissionKeys>).reduce<Array<IGroupPermission>>(
    (acc, key) => {
        acc.push(GroupPermission[key]);

        return acc;
    },
    []
);

export const groupSchema = Joi.object<IGroupEntity, true>({
    id: Joi.string().required(),

    name: Joi.string().required(),

    permissions: Joi.array()
        .items(Joi.string().valid(...validPermissions))
        .required()
});

export class GroupEntity extends BaseEntity implements IGroupEntity {
    readonly name: string;

    readonly permissions: Array<IGroupPermission>;

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
