import { IDatabaseDriver } from '@common/drivers';
import { IRepositoryMatchers, IRepositoryFilters, IBaseRepository } from '@common/repositories';
import { UserEntity } from '../entities';
import { IUserRepository } from '../services';

export const USER_REPOSITORY_MODEL = 'user';

export class UserRepository implements IUserRepository {
    private readonly userModel: IBaseRepository<UserEntity>;

    constructor(databaseDriver: IDatabaseDriver) {
        this.userModel = databaseDriver.getModel<UserEntity>(USER_REPOSITORY_MODEL);
    }

    async getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<UserEntity[]> {
        return this.userModel.find(
            {
                login: loginSubstring
            },
            {
                limit
            }
        );
    }

    async find(matchers?: IRepositoryMatchers<UserEntity>, filters?: IRepositoryFilters): Promise<UserEntity[]> {
        return this.userModel.find(matchers, filters);
    }

    async findById(id: string): Promise<UserEntity | null> {
        return this.userModel.findById(id);
    }

    async save(entity: UserEntity): Promise<UserEntity> {
        return this.userModel.save(entity);
    }

    async updateOne(id: string, partialEntity: Partial<Omit<UserEntity, 'id'>>): Promise<UserEntity | null> {
        return this.userModel.updateOne(id, partialEntity);
    }

    async deleteOne(id: string): Promise<UserEntity | null> {
        return this.userModel.deleteOne(id);
    }
}
