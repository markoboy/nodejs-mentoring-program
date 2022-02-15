import { Provider } from '@common/decorators';
import { IDatabaseDriver } from '@common/drivers';
import { IBaseEntity } from '@common/entities';
import { BadRequestException } from '@common/exceptions';
import { IBaseRepository } from '@common/repositories';
import { MemoryRepository } from './memory.repository';

@Provider()
export class MemoryDatabase implements IDatabaseDriver {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly repositories: Map<string, IBaseRepository<any>> = new Map();

    getRepository<T extends IBaseEntity>(entityName: string): IBaseRepository<T> {
        const dataModel = this.repositories.get(entityName);

        if (!dataModel) {
            return this.createRepository(entityName);
        }

        return dataModel;
    }

    private createRepository<T extends IBaseEntity>(entityName: string): IBaseRepository<T> {
        if (this.repositories.has(entityName)) {
            throw new BadRequestException(`Repository: ${entityName} already exists.`);
        }

        const repository = new MemoryRepository<T>(entityName);

        this.repositories.set(entityName, repository);

        return repository;
    }

    async destroy(): Promise<void> {
        this.repositories.clear();
    }
}
