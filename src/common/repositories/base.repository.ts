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

export interface IBaseRepository<T extends IBaseEntity = IBaseEntity> {
    find(matchers?: IRepositoryMatchers<T>, filters?: IRepositoryFilters): Promise<T[]>;
    findById(id: T['id']): Promise<T | null>;
    save(entity: T): Promise<T>;
    updateOne(id: T['id'], partialEntity: Partial<Omit<T, 'id'>>): Promise<T | null>;
    deleteOne(id: T['id']): Promise<T | null>;
}
