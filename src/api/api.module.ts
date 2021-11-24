import { Module } from '@common/decorators';
import { UserModule } from './users';

@Module({
    prefix: '/api',
    imports: [UserModule]
})
export class ApiModule {}
