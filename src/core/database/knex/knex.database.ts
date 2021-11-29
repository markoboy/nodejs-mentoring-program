import { Provider } from '@common/decorators';
import { IDatabaseDriver } from '@common/drivers';
import { IBaseEntity } from '@common/entities';
import { BadRequestException } from '@common/exceptions';
import { IBaseRepository } from '@common/repositories';
import { Knex } from 'knex';
import { createKnex, knexConfig } from './knexfile';
import { KnexRepository } from './knex.repository';

@Provider()
export class KnexDatabase implements IDatabaseDriver {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly repositories: Map<string, IBaseRepository<any>> = new Map();

    private readonly knex: Knex;

    constructor() {
        this.knex = createKnex(knexConfig);
        console.log(this.knex);
    }

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

        const repository = new KnexRepository<T>(entityName, this.knex);

        this.repositories.set(entityName, repository);

        return repository;
    }
}
