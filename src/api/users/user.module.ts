import { Module } from '@common/decorators';
import { UserController } from './controllers';
import { HashService, UserService } from './services';

@Module({
    controllers: [UserController],
    providers: [HashService, UserService]
})
export class UserModule {}
