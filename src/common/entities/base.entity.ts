import { generateUUID } from '@common/utils';

export interface IBaseEntity {
    id: string;
}

export class BaseEntity {
    public readonly id;

    protected constructor({ id }: IBaseEntity) {
        this.id = id ?? generateUUID();
    }

    public static generateUUID = generateUUID;
}
