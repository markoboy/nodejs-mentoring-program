import { Module } from '@common/decorators';
import { UserController } from './controllers';
import { AuthService, HashService, UserService } from './services';

@Module({
    controllers: [UserController],
    providers: [HashService, UserService, AuthService],
    exports: [AuthService]
})
export class UserModule {}
