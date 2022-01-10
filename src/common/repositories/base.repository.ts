import { IBaseEntity } from '@common/entities';

export interface IRepositoryMatcherField<T> {
    value: T;
    exact?: boolean;
}

export type IRepositoryMatcher<T> = T | IRepositoryMatcherField<T>;

export type IRepositoryMatchers<T extends IBaseEntity = IBaseEntity> = {
    [K in keyof T]?: IRepositoryMatcher<T[K]>;
};

export interface IRepositoryFilters {
    limit?: number;
}

export interface ITransaction<T = unknown> {
    trx: T;
}

export interface ITransactionCallback<T = unknown, R = unknown> {
    (trx: ITransaction<T>): Promise<R>;
}

export interface IManyEntityRelation<T extends IBaseEntity> {
    /**
     * The repository entity id to attach a many-to-many relation.
     *
     * Eg. If the repository in use is the `User` model then the id needs to be
     * the user's id.
     */
    id: T['id'];

    /**
     * The relation model name.
     *
     * Eg. If we want to attach a `User` to many `Group` this will be the model
     * name that contains the relations. `user_group`.
     */
    relationName: string;

    /**
     * The relation entity name that is being attached on the repository.
     *
     * Eg. If the ids to attach are from the `Group` entity then this would be
     * the repository's entity name.
     */
    relationEntityName: string;

    /**
     * The relation ids to attach on the repository.
     *
     * Eg. If we are attaching many `Groups` to the repository then the
     * ids would be an array of groups ids.
     */
    relationIds: IBaseEntity['id'][];
}

export interface IReadRepository<T extends IBaseEntity = IBaseEntity> {
    find(matchers?: IRepositoryMatchers<T>, filters?: IRepositoryFilters): Promise<T[]>;
    findById(id: T['id']): Promise<T | null>;
}

export interface IWriteRepository<T extends IBaseEntity = IBaseEntity> {
    addManyRelation(options: IManyEntityRelation<T>, trx?: ITransaction): Promise<boolean>;
    create(entity: Partial<T>, trx?: ITransaction): Promise<T>;
    updateOne(id: T['id'], partialEntity: Partial<Omit<T, 'id'>>): Promise<boolean>;
    softDeleteOne(id: T['id']): Promise<boolean>;
    transaction<R = unknown>(cb: ITransactionCallback<unknown, R>): Promise<R>;
    deleteOne(id: T['id']): Promise<boolean>;
}

export interface IBaseRepository<T extends IBaseEntity = IBaseEntity> extends IReadRepository<T>, IWriteRepository<T> {}

export interface IRepositoryConstructable<T extends IBaseEntity = IBaseEntity> {
    new (entityName: string): IBaseRepository<T>;
}
