import { Knex } from 'knex';
import { IBaseEntity } from '@common/entities';
import { Exception, NotFoundException } from '@common/exceptions';
import {
    IBaseRepository,
    IRepositoryFilters,
    IRepositoryMatcher,
    IRepositoryMatcherField,
    IRepositoryMatchers
} from '@common/repositories';
import { isRepositoryMatcherField } from '@common/utils';

export class KnexRepository<T extends IBaseEntity> implements IBaseRepository<T> {
    constructor(protected readonly entityName: string, protected readonly knex: Knex) {}

    async find(matchers?: IRepositoryMatchers<T>, filters?: IRepositoryFilters): Promise<T[]> {
        const query = this.knex.select('*').from<T>(this.entityName);

        KnexRepository.applyWhere(query, matchers);

        KnexRepository.applyFilters(query, filters);

        const results = await KnexRepository.runQuery(query);

        return results as T[];
    }

    async findById(id: T['id']): Promise<T | null> {
        const query = this.knex.select('*').from(this.entityName).where({ id }).first();

        const item = (await KnexRepository.runQuery(query)) as T;

        return item ?? null;
    }

    async create({ id, ...entity }: T): Promise<T> {
        const query = this.knex.insert<T>(entity).into<T>(this.entityName).returning('id');

        const [dbId] = await KnexRepository.runQuery(query);

        const storedEntity: T = {
            ...(entity as T),
            id: dbId
        };

        return storedEntity;
    }

    async updateOne(id: T['id'], partialEntity: Partial<T>): Promise<boolean> {
        const query = this.knex.update(partialEntity).from(this.entityName).where({ id });

        const affectedItems = await KnexRepository.runQuery(query);

        if (!affectedItems) {
            throw new NotFoundException(`${this.entityName} with id: ${id} does not exist`);
        }

        return affectedItems === 1;
    }

    async deleteOne(id: T['id']): Promise<boolean> {
        const query = this.knex.update({ isDeleted: true }).from(this.entityName).where({ id });

        const affectedItems = await KnexRepository.runQuery(query);

        if (!affectedItems) {
            throw new NotFoundException(`${this.entityName} with id: ${id} does not exist`);
        }

        return affectedItems === 1;
    }

    protected static async runQuery<T, P>(query: Knex.QueryBuilder<T, P>): Promise<Knex.QueryBuilder<T, P>> {
        try {
            return await query;
        } catch (error) {
            console.error(error);

            throw new Exception('An unexpected error occurred, please try again later or contact an administrator');
        }
    }

    protected static getMatcherField(
        field: IRepositoryMatcher<Knex.Value | undefined>
    ): IRepositoryMatcherField<Knex.Value | undefined> {
        let exact = false;
        let value: Knex.Value | undefined;

        // Check if we should do exact matching or partial matching
        if (isRepositoryMatcherField(field)) {
            ({ value, exact = false } = field);
        } else {
            value = field;
        }

        return {
            exact,
            value
        };
    }

    protected static applyWhere(queryBuilder: Knex.QueryBuilder, matchers?: IRepositoryMatchers): void {
        if (!matchers) {
            return;
        }

        let appliedWhere = false;
        const matchersKeys = Object.keys(matchers ?? {}) as unknown as (keyof IRepositoryMatchers)[];

        matchersKeys.forEach((key) => {
            const { exact, value } = KnexRepository.getMatcherField(matchers[key]);

            // If no value is defined then go to next column key
            if (typeof value === 'undefined' || value === null) {
                return;
            }

            const whereMethod = appliedWhere ? 'andWhere' : 'where';

            // Check exact match when exact is set or the value is not a string
            if (exact || typeof value !== 'string') {
                queryBuilder[whereMethod]({ [key]: value });
            } else {
                queryBuilder[whereMethod](key, 'like', `%${value}%`);
            }

            appliedWhere = true;
        });
    }

    protected static applyFilters(queryBuilder: Knex.QueryBuilder, filters?: IRepositoryFilters): void {
        if (filters?.limit) {
            queryBuilder.limit(filters.limit);
        }
    }
}
