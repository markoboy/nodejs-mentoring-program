import Joi from 'joi';

import { BaseEntity, IBaseEntity } from '@common/entities';
import { ValidationException } from '@common/exceptions';

import * as Permissions from '../constants/group-permissions';

type IPermissionsKeys = keyof typeof Permissions;

export type IPermission = typeof Permissions[IPermissionsKeys];

export interface IPermissionEntity extends IBaseEntity {
    name: IPermission;
}

export const validPermissions = (Object.keys(Permissions) as Array<IPermissionsKeys>).reduce<Array<IPermission>>(
    (acc, key) => {
        acc.push(Permissions[key]);

        return acc;
    },
    []
);

const permissionSchema = Joi.object<IPermissionEntity, true>({
    id: Joi.string().required(),

    name: Joi.string()
        .valid(...validPermissions)
        .required()
});

export class PermissionEntity extends BaseEntity implements IPermissionEntity {
    readonly name: IPermission;

    protected constructor({ id, name }: IPermissionEntity) {
        super({ id });

        this.name = name;
    }

    static async create(permission: Partial<IPermissionEntity>): Promise<PermissionEntity> {
        try {
            if (!permission.id) {
                permission.id = this.generateUUID();
            }

            const validatedPermission: IPermissionEntity = await permissionSchema.validateAsync(permission);

            return new PermissionEntity(validatedPermission);
        } catch (error) {
            throw new ValidationException((error as Error).message);
        }
    }
}
