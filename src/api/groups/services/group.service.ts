import isEqual from 'lodash.isequal';

import { IUserEntity } from '@api/users/entities';
import { Inject, Provider } from '@common/decorators';
import { BadRequestException, NotFoundException } from '@common/exceptions';
import { IBaseRepository, ITransaction } from '@common/repositories';
import {
    GROUP_PERMISSION_REPOSITORY_MODEL,
    GROUP_REPOSITORY_MODEL,
    PERMISSION_REPOSITORY_MODEL,
    USER_GROUP_REPOSITORY_MODEL,
    USER_REPOSITORY_MODEL
} from '@constants';
import { CORE_INTERFACES, CORE_TYPES } from '@core';

import { GroupEntity, IGroupEntity, IPermissionEntity } from '../entities';

@Provider()
export class GroupService {
    private readonly groupRepository: IBaseRepository<GroupEntity>;

    private readonly permissionRepository: IBaseRepository<IPermissionEntity>;

    constructor(@Inject(CORE_TYPES.DatabaseDriver) private readonly databaseDriver: CORE_INTERFACES.DatabaseDriver) {
        this.groupRepository = databaseDriver.getRepository<GroupEntity>(GROUP_REPOSITORY_MODEL);
        this.permissionRepository = this.databaseDriver.getRepository<IPermissionEntity>(PERMISSION_REPOSITORY_MODEL);
    }

    async find(): Promise<IGroupEntity[]> {
        const groups = await this.groupRepository.find();

        const populatedGroups: IGroupEntity[] = [];
        for (const group of groups) {
            populatedGroups.push(await this.getGroupWithPermissions(group));
        }

        return populatedGroups;
    }

    async findById(id: string): Promise<IGroupEntity> {
        const group = await this.groupRepository.findById(id);

        if (!group) {
            throw new NotFoundException(`Group with id: ${id} was not found`);
        }

        return this.getGroupWithPermissions(group);
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

            const relatedPermissions = await this.permissionRepository.find({ name: { value: permissions } });

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
        return this.groupRepository.transaction<boolean>(async (trx) => {
            const existingGroup = await this.groupRepository.findById(id);

            if (!existingGroup) {
                throw new NotFoundException(`Group with id: ${id} was not found`);
            }

            const groupEntity = await GroupEntity.create({
                ...(await this.getGroupWithPermissions(existingGroup, trx)),
                ...group
            });

            const hasChangedPermissions = !isEqual(existingGroup.permissions, groupEntity.permissions);
            const { permissions, ...groupToUpdate } = groupEntity;

            if (hasChangedPermissions) {
                const relatedPermissions = await this.permissionRepository.find({ name: { value: permissions } });
                await this.groupRepository.updateManyRelation(
                    {
                        id: groupToUpdate.id,
                        relationName: GROUP_PERMISSION_REPOSITORY_MODEL,
                        relationEntityName: PERMISSION_REPOSITORY_MODEL,
                        relationIds: relatedPermissions.map((p) => p.id)
                    },
                    trx
                );
            }

            return this.groupRepository.updateOne(id, groupToUpdate);
        });
    }

    async deleteOne(id: string): Promise<boolean> {
        return this.groupRepository.deleteOne(id);
    }

    async addUsersToGroup(groupId: IGroupEntity['id'], userIds: IUserEntity['id'][]): Promise<boolean> {
        return this.groupRepository.addManyRelation({
            id: groupId,
            relationName: USER_GROUP_REPOSITORY_MODEL,
            relationEntityName: USER_REPOSITORY_MODEL,
            relationIds: userIds
        });
    }

    private async getGroupWithPermissions(group: IGroupEntity, trx?: ITransaction): Promise<IGroupEntity> {
        const permissions = await this.groupRepository.getManyRelation<IPermissionEntity>(
            {
                id: group.id,
                relationName: GROUP_PERMISSION_REPOSITORY_MODEL,
                relationEntityName: PERMISSION_REPOSITORY_MODEL
            },
            trx
        );

        return {
            ...group,
            permissions: permissions.map((p) => p.name)
        };
    }
}
