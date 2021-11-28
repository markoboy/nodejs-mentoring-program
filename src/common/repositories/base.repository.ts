import { IBaseEntity } from '@common/entities';

export interface IRepositoryMatcherField<T> {
    value: T;
    exact?: boolean;
}

export type IRepositoryMatcher<T> = T | IRepositoryMatcherField<T>;

export type IRepositoryMatchers<T extends IBaseEntity> = {
    [K in keyof T]?: IRepositoryMatcher<T[K]>;
};

export interface IRepositoryFilters {
    limit?: number;
}

export interface IReadRepository<T extends IBaseEntity = IBaseEntity> {
    find(matchers?: IRepositoryMatchers<T>, filters?: IRepositoryFilters): Promise<T[]>;
    findById(id: T['id']): Promise<T | null>;
}

export interface IWriteRepository<T extends IBaseEntity = IBaseEntity> {
    create(entity: Partial<T>): Promise<T>;
    updateOne(id: T['id'], partialEntity: Partial<Omit<T, 'id'>>): Promise<boolean>;
    deleteOne(id: T['id']): Promise<boolean>;
}

export interface IBaseRepository<T extends IBaseEntity = IBaseEntity> extends IReadRepository<T>, IWriteRepository<T> {}

export interface IRepositoryConstructable<T extends IBaseEntity = IBaseEntity> {
    new (entityName: string): IBaseRepository<T>;
}
