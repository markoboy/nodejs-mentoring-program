import { generateUUID } from '@common/utils';

export interface IBaseEntity {
    id: string;
    isDeleted: boolean;
}

export class BaseEntity {
    public readonly id;
    public readonly isDeleted;

    protected constructor({ id, isDeleted }: Partial<IBaseEntity> = {}) {
        this.id = id ?? generateUUID();
        this.isDeleted = isDeleted ?? false;
    }

    public static generateUUID = generateUUID;
}
