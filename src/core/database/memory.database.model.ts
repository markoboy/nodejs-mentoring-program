import { IDatabaseModel } from '@common/drivers';
import { IBaseEntity } from '@common/entities';
import { ExistsException } from '@common/exceptions';
import { IRepositoryFilters, IRepositoryMatcher, IRepositoryMatchers } from '@common/repositories';
import { isRepositoryMatcherField } from '@common/utils';

export class MemoryDatabaseModel<T extends IBaseEntity> implements IDatabaseModel<T> {
    private readonly store: Map<T['id'], T> = new Map();

    constructor(protected readonly model: string) {}

    async find(matchers?: IRepositoryMatchers<T>, filters?: IRepositoryFilters): Promise<T[]> {
        const results: T[] = [];

        let done = false;
        const storeIterator = this.store.values();

        while (!done) {
            const next = storeIterator.next();

            if (next.value && MemoryDatabaseModel.matches<T>(next.value, matchers)) {
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

    async save(entity: T): Promise<T> {
        if (this.store.has(entity.id)) {
            throw new ExistsException(`${this.model} with id: ${entity.id} already exists`);
        }

        this.store.set(entity.id, entity);

        return this.store.get(entity.id) ?? entity;
    }

    async updateOne(id: T['id'], partialEntity: Partial<Omit<T, 'id'>>): Promise<T | null> {
        const existingItem = this.store.get(id);

        if (!existingItem) {
            return null;
        }

        this.store.set(id, {
            ...existingItem,
            ...partialEntity
        });

        return this.store.get(id) ?? null;
    }

    async deleteOne(id: T['id']): Promise<T | null> {
        const existingItem = this.store.get(id);

        if (!existingItem) {
            return null;
        }

        this.store.set(id, {
            ...existingItem,
            isDeleted: true
        });

        return this.store.get(id) ?? null;
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
                let value: P[typeof key] | undefined;

                // Check if we should do exact matching or partial matching
                if (isRepositoryMatcherField(field)) {
                    ({ value, exact = false } = field);
                } else {
                    value = field;
                }

                // Check string types
                const stringMatches = MemoryDatabaseModel.stringMatches(entityField, value, exact);

                // Check other types. Only primitive values are supported.
                const otherMatches = typeof value !== 'string' && entityField === value;

                matches = matches && (stringMatches || otherMatches);
            });
        }

        return matches;
    }
}
