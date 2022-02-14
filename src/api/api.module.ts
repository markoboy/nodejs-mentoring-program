import { IMiddlewareConsumer, IMiddlewareModule } from '@common/controllers';
import { Module } from '@common/decorators';
import { GroupModule } from './groups';
import { AuthMiddleware, UserModule } from './users';

@Module({
    prefix: '/api',
    imports: [UserModule, GroupModule]
})
export class ApiModule implements IMiddlewareModule {
    configure(consumer: IMiddlewareConsumer): void {
        consumer.apply(AuthMiddleware).forRoutes('*').exclude('/api/users/login');
    }
}
