import { Module } from '@common/decorators';
import { UserController } from './controllers';
import { UserRepository } from './repositories';
import { HashService, UserService } from './services';
import { USER_TYPES } from './user.ioc';

@Module({
    controllers: [UserController],
    providers: [
        {
            type: USER_TYPES.UserRepository,
            target: UserRepository
        },
        HashService,
        UserService
    ]
})
export class UserModule {}
