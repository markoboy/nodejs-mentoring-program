import { ApiModule } from '@api';
import { Module } from '@common/decorators';
import { DatabaseModule } from '@core/database';

@Module({
    imports: [DatabaseModule, ApiModule]
})
export class AppModule {}
