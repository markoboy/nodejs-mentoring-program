import { Module } from '@common/decorators';
import { CORE_TYPES } from '@core';
import { MemoryDatabase } from './memory';

const databaseProvider = {
    type: CORE_TYPES.DatabaseDriver,
    target: MemoryDatabase
};

@Module({
    providers: [databaseProvider],
    exports: [databaseProvider]
})
export class DatabaseModule {}
