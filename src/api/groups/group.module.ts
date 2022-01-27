import { Module } from '@common/decorators';
import { GroupController } from './controllers';
import { GroupService } from './services';

@Module({
    controllers: [GroupController],
    providers: [GroupService]
})
export class GroupModule {}
