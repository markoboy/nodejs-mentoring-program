import { IBaseEntity } from '@common/entities';
import { IRepositoryFilters, IRepositoryMatchers } from '@common/repositories';

export interface IDatabaseModel<T extends IBaseEntity = IBaseEntity> {
    find(matchers?: IRepositoryMatchers<T>, filters?: IRepositoryFilters): Promise<T[]>;
    findById(id: T['id']): Promise<T | null>;
    save(entity: T): Promise<T>;
    updateOne(id: T['id'], partialEntity: Partial<Omit<T, 'id'>>): Promise<T | null>;
    deleteOne(id: T['id']): Promise<T | null>;
}

export interface IDatabaseDriver {
    getModel<T extends IBaseEntity>(model: string): IDatabaseModel<T>;
    createModel<T>(model: string, schema: T): Promise<boolean>;
    deleteModel(model: string): Promise<boolean>;
    updateModel<T>(model: string, schema: T): Promise<boolean>;
}
