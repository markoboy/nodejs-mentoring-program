import { Module } from '@common/decorators';
import { CORE_TYPES } from '@core';
import { KnexDatabase } from './knex';

const databaseProvider = {
    type: CORE_TYPES.DatabaseDriver,
    target: KnexDatabase
};

@Module({
    providers: [databaseProvider],
    exports: [databaseProvider]
})
export class DatabaseModule {}
