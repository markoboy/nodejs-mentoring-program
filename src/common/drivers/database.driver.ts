import { IBaseEntity } from '@common/entities';
import { IBaseRepository, IRepositoryConstructable } from '@common/repositories';

export interface IDatabaseDriver {
    getRepository<T extends IBaseEntity>(
        ...args: ConstructorParameters<IRepositoryConstructable<T>>
    ): IBaseRepository<T>;
}
