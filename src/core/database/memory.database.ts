import { IDatabaseDriver, IDatabaseModel } from '@common/drivers';
import { IBaseEntity } from '@common/entities';
import { ExistsException, NotFoundException } from '@common/exceptions';
import { MemoryDatabaseModel } from './memory.database.model';

export class MemoryDatabase implements IDatabaseDriver {
    private readonly models: Map<string, IDatabaseModel<never>> = new Map();

    getModel<T extends IBaseEntity>(model: string): IDatabaseModel<T> {
        const dataModel = this.models.get(model);

        if (!dataModel) {
            throw new NotFoundException(`Model: ${model} was not found.`);
        }

        return dataModel;
    }

    async createModel(model: string): Promise<boolean> {
        if (this.models.has(model)) {
            throw new ExistsException(`Model: ${model} already exists.`);
        }

        this.models.set(model, new MemoryDatabaseModel(model));

        return this.models.has(model);
    }

    async deleteModel(model: string): Promise<boolean> {
        if (!this.models.has(model)) {
            throw new ExistsException(`Model: ${model} does not exist.`);
        }

        this.models.delete(model);

        return !this.models.has(model);
    }

    async updateModel(model: string): Promise<boolean> {
        if (!this.models.has(model)) {
            throw new ExistsException(`Model: ${model} does not exist.`);
        }

        // Memory database doesn't have schema to update. Return true at all times.
        return true;
    }
}
