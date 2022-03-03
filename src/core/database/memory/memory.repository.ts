/* eslint-disable @typescript-eslint/no-unused-vars */
import { IBaseEntity } from '@common/entities';
import { BadRequestException, NotFoundException } from '@common/exceptions';
import {
    IBaseRepository,
    IManyEntityRelation,
    IRepositoryFilters,
    IRepositoryMatcher,
    IRepositoryMatchers,
    ITransaction,
    ITransactionCallback
} from '@common/repositories';
import { isRepositoryMatcherField } from '@common/utils';

export class MemoryRepository<T extends IBaseEntity> implements IBaseRepository<T> {
    private readonly store: Map<T['id'], T> = new Map();

    constructor(protected readonly entityName: string) {}

    async getManyRelation<R>(
        options: Omit<IManyEntityRelation<T>, 'relationIds'>,
        trx?: ITransaction<unknown>
    ): Promise<R[]> {
        return [];
    }

    async addManyRelation(options: IManyEntityRelation<T>, trx?: ITransaction<unknown>): Promise<boolean> {
        return false;
    }

    async updateManyRelation(options: IManyEntityRelation<T>, trx?: ITransaction<unknown>): Promise<boolean> {
        return false;
    }

    async softDeleteOne(id: T['id']): Promise<boolean> {
        return false;
    }

    async transaction<R = unknown>(cb: ITransactionCallback<unknown, R>): Promise<R> {
        return cb({ trx: null });
    }

    async find(matchers?: IRepositoryMatchers<T>, filters?: IRepositoryFilters): Promise<T[]> {
        const results: T[] = [];

        let done = false;
        const storeIterator = this.store.values();

        while (!done) {
            const next = storeIterator.next();

            if (next.value && MemoryRepository.matches<T>(next.value, matchers)) {
                results.push(next.value);
            }

            done = Boolean(next.done || results.length === (filters?.limit ?? 100));
        }

        return results;
    }

    async findById(id: T['id']): Promise<T | null> {
        const item = this.store.get(id);

        return item ?? null;
    }

    async create(entity: T): Promise<T> {
        if (this.store.has(entity.id)) {
            throw new BadRequestException(`${this.entityName} with id: ${entity.id} already exists`);
        }

        this.store.set(entity.id, entity);

        return {
            ...entity,
            id: entity.id
        };
    }

    async updateOne(id: T['id'], partialEntity: Partial<Omit<T, 'id'>>): Promise<boolean> {
        const existingItem = this.store.get(id);

        if (!existingItem) {
            throw new NotFoundException(`${this.entityName} with id: ${id} does not exist`);
        }

        this.store.set(id, {
            ...existingItem,
            ...partialEntity
        });

        return true;
    }

    async deleteOne(id: T['id']): Promise<boolean> {
        const existingItem = this.store.get(id);

        if (!existingItem) {
            throw new NotFoundException(`${this.entityName} with id: ${id} does not exist`);
        }

        this.store.set(id, {
            ...existingItem,
            isDeleted: true
        });

        return true;
    }

    protected static stringMatches(value: unknown, valueToCompare: unknown, exact: boolean): boolean {
        if (typeof valueToCompare === 'string' && typeof value === 'string') {
            const lowerCaseValue = value.toLowerCase();
            const lowerCaseValueToCompare = valueToCompare.toLowerCase();

            const isExact = exact && lowerCaseValue === lowerCaseValueToCompare;
            const isPartial = !exact && lowerCaseValue.includes(lowerCaseValueToCompare);

            return isExact || isPartial;
        }

        return false;
    }

    protected static matches<P extends IBaseEntity>(entity: P, matchers?: IRepositoryMatchers<P>): boolean {
        let matches = true;

        if (matchers) {
            const matchersKeys = Object.keys(matchers ?? {}) as unknown as (keyof P)[];

            matchersKeys.forEach((key) => {
                const entityField = entity[key];
                const field = matchers[key] as IRepositoryMatcher<P[typeof key]>;

                let exact = false;
                let value: P[typeof key] | P[keyof P][];

                // Check if we should do exact matching or partial matching
                if (isRepositoryMatcherField(field)) {
                    ({ value, exact = false } = field);
                } else {
                    value = field;
                }

                // Check string types
                const stringMatches = MemoryRepository.stringMatches(entityField, value, exact);

                // Check other types. Only primitive values are supported.
                const otherMatches = typeof value !== 'string' && entityField === value;

                matches = matches && (stringMatches || otherMatches);
            });
        }

        return matches;
    }
}
