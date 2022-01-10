import { Module } from '@common/decorators';
import { GroupModule } from './groups';
import { UserModule } from './users';

@Module({
    prefix: '/api',
    imports: [UserModule, GroupModule]
})
export class ApiModule {}
