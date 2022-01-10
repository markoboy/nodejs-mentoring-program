import { IUserEntity } from '@api/users/entities';
import { Inject, Provider } from '@common/decorators';
import { NotFoundException, BadRequestException } from '@common/exceptions';
import { IBaseRepository } from '@common/repositories';
import {
    GROUP_PERMISSION_REPOSITORY_MODEL,
    GROUP_REPOSITORY_MODEL,
    PERMISSION_REPOSITORY_MODEL,
    USER_GROUP_REPOSITORY_MODEL,
    USER_REPOSITORY_MODEL
} from '@constants';
import { CORE_TYPES, CORE_INTERFACES } from '@core';

import { IGroupEntity, GroupEntity, IGroupPermission } from '../entities';

@Provider()
export class GroupService {
    private readonly groupRepository: IBaseRepository<GroupEntity>;

    constructor(@Inject(CORE_TYPES.DatabaseDriver) private readonly databaseDriver: CORE_INTERFACES.DatabaseDriver) {
        this.groupRepository = databaseDriver.getRepository<GroupEntity>(GROUP_REPOSITORY_MODEL);
    }

    async find(): Promise<IGroupEntity[]> {
        return this.groupRepository.find();
    }

    async findById(id: string): Promise<IGroupEntity> {
        const group = await this.groupRepository.findById(id);

        if (!group) {
            throw new NotFoundException(`Group with id: ${id} was not found`);
        }

        return group;
    }

    async create(group: Omit<IGroupEntity, 'id' | 'isDeleted'>): Promise<IGroupEntity> {
        const existingGroup = await this.groupRepository.find(
            { name: { value: group.name, exact: true } },
            { limit: 1 }
        );

        if (existingGroup.length) {
            throw new BadRequestException(`Group with name: ${group.name} already exists`);
        }

        const newGroup = await GroupEntity.create(group);

        return this.groupRepository.transaction<IGroupEntity>(async (trx) => {
            const { permissions, ...groupEntity } = newGroup;

            const entity = await this.groupRepository.create(groupEntity, trx);

            const permissionRepo =
                this.databaseDriver.getRepository<{ id: string; name: IGroupPermission }>(PERMISSION_REPOSITORY_MODEL);

            const relatedPermissions = await permissionRepo.find({ name: { value: permissions } });

            await this.groupRepository.addManyRelation(
                {
                    id: entity.id,
                    relationName: GROUP_PERMISSION_REPOSITORY_MODEL,
                    relationEntityName: PERMISSION_REPOSITORY_MODEL,
                    relationIds: relatedPermissions.map((p) => p.id)
                },
                trx
            );

            return { ...entity, permissions };
        });
    }

    async updateOne(id: string, group: Partial<Omit<IGroupEntity, 'id'>>): Promise<boolean> {
        const existingGroup = await this.groupRepository.findById(id);

        if (!existingGroup) {
            throw new NotFoundException(`Group with id: ${id} was not found`);
        }

        const groupEntity = await GroupEntity.create({
            ...existingGroup,
            ...group
        });

        return this.groupRepository.updateOne(id, groupEntity);
    }

    async deleteOne(id: string): Promise<boolean> {
        return this.groupRepository.deleteOne(id);
    }

    async addUsersToGroup(groupId: IGroupEntity['id'], userIds: IUserEntity['id'][]): Promise<unknown> {
        return this.groupRepository.addManyRelation({
            id: groupId,
            relationName: USER_GROUP_REPOSITORY_MODEL,
            relationEntityName: USER_REPOSITORY_MODEL,
            relationIds: userIds
        });
    }
}
