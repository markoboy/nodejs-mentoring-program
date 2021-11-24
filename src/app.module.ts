import { Module } from '@common/decorators';
import { ApiModule } from '@api';
import { CORE_TYPES } from '@core/core.ioc';
import { MemoryDatabase } from '@core/database';

@Module({
    providers: [
        {
            type: CORE_TYPES.DatabaseDriver,
            target: MemoryDatabase
        }
    ],
    imports: [ApiModule]
})
export class AppModule {}
