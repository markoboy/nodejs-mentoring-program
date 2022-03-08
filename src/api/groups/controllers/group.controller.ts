import { HttpRequest } from '@common/controllers';
import { Controller, Delete, Get, HttpStatus, Patch, Post } from '@common/decorators';

import { AddUsersToGroupDTO, CreateGroupDTO, FindOneGroupDTO, UpdateGroupDTO } from '../dtos';
import { IGroupEntity } from '../entities';
import { GroupService } from '../services';

@Controller('/groups')
export class GroupController {
    constructor(private readonly groupService: GroupService) {}

    @Post('/', HttpStatus.CREATED)
    async create(httpRequest: HttpRequest): Promise<IGroupEntity> {
        const createGroup = await CreateGroupDTO.from(httpRequest.body);

        return this.groupService.create(createGroup);
    }

    @Get('/')
    async find(): Promise<IGroupEntity[]> {
        return this.groupService.find();
    }

    @Get('/:id')
    async findOne(httpRequest: HttpRequest): Promise<IGroupEntity> {
        const { id } = await FindOneGroupDTO.from(httpRequest.params);

        return this.groupService.findById(id);
    }

    @Patch('/:id')
    async update(httpRequest: HttpRequest): Promise<boolean> {
        const { id } = await FindOneGroupDTO.from(httpRequest.params);
        const updateGroup = await UpdateGroupDTO.from(httpRequest.body);

        return this.groupService.updateOne(id, updateGroup);
    }

    @Delete('/:id')
    async delete(httpRequest: HttpRequest): Promise<boolean> {
        const { id } = await FindOneGroupDTO.from(httpRequest.params);

        return this.groupService.deleteOne(id);
    }

    @Post('/relation/:id', HttpStatus.CREATED)
    async addUsersToGroup(httpRequest: HttpRequest): Promise<boolean> {
        const { id } = await FindOneGroupDTO.from(httpRequest.params);
        const { userIds } = await AddUsersToGroupDTO.from(httpRequest.body);

        return this.groupService.addUsersToGroup(id, userIds);
    }
}
