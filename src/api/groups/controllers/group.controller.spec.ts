import { anything, instance, mock, reset, when } from 'ts-mockito';

import { ValidationException } from '@common/exceptions';
import { HttpRequest } from '@common/controllers';

import { AddUsersToGroupDTO, CreateGroupDTO, UpdateGroupDTO } from '../dtos';
import { IGroupEntity } from '../entities';
import { GroupService } from '../services';
import { GroupController } from './group.controller';

describe('Group controller', () => {
    const mockedService: GroupService = mock(GroupService);
    const groupService: GroupService = instance(mockedService);

    const groupController = new GroupController(groupService);

    const mockedRequest: HttpRequest = mock<HttpRequest>();
    let request = instance(mockedRequest);

    afterEach(() => {
        reset(mockedService);

        const mockedRequest2: HttpRequest = mock<HttpRequest>();
        request = instance(mockedRequest2);
    });

    describe('given "create" method is called', () => {
        let results: IGroupEntity;
        let error: Error;

        beforeEach(async () => {
            try {
                results = await groupController.create(request);
            } catch (err) {
                error = err as Error;
            }
        });

        describe('when request body is correct', () => {
            const groupBody: CreateGroupDTO = {
                name: 'read-only',
                permissions: ['READ']
            };
            const groupId = 'some-id';

            beforeAll(() => {
                request.body = groupBody as Partial<CreateGroupDTO>;

                when(mockedService.create(anything())).thenResolve({ id: groupId, ...groupBody });
            });

            it('then results should contain the created group', () => {
                expect(results).toEqual({
                    ...groupBody,
                    id: groupId
                });
            });
        });

        describe('when request is incorrect', () => {
            beforeAll(() => {
                request.body = {};
            });

            it('then should throw a "ValidationException" error', () => {
                expect(error).toBeInstanceOf(ValidationException);
                expect(error.message).toEqual(expect.stringContaining('is required'));
            });
        });
    });

    describe('given "find" method is called', () => {
        let results: IGroupEntity[];

        beforeEach(async () => {
            results = await groupController.find();
        });

        describe('when service responds with a group', () => {
            const group: IGroupEntity = {
                id: 'some-id',
                name: 'read-only',
                permissions: ['READ']
            };

            beforeAll(() => {
                when(mockedService.find()).thenResolve([group]);
            });

            it('then results should contain a list of groups', () => {
                expect(results).toEqual([group]);
            });
        });
    });

    describe('given "findOne" method is called', () => {
        let results: IGroupEntity;

        beforeEach(async () => {
            results = await groupController.findOne(request);
        });

        describe('when service responds with a group', () => {
            const group: IGroupEntity = {
                id: 'some-id',
                name: 'read-only',
                permissions: ['READ']
            };

            beforeAll(() => {
                request.params = {
                    id: group.id
                };
                when(mockedService.findById(group.id)).thenResolve(group);
            });

            it('then results should contain a list of groups', () => {
                expect(results).toEqual(group);
            });
        });
    });

    describe('given "update" method is called', () => {
        let results: boolean;
        let error: Error;

        beforeEach(async () => {
            try {
                results = await groupController.update(request);
            } catch (err) {
                error = err as Error;
            }
        });

        describe('when request body is correct', () => {
            const groupBody: UpdateGroupDTO = {
                name: 'read-update',
                permissions: ['READ', 'WRITE']
            };
            const groupId = 'some-id';

            beforeAll(() => {
                request.params = { id: groupId };
                request.body = groupBody as Partial<CreateGroupDTO>;

                when(mockedService.updateOne(groupId, anything())).thenResolve(true);
            });

            it('then results should return true', () => {
                expect(results).toBeTruthy();
            });
        });

        describe('when request is incorrect', () => {
            beforeAll(() => {
                request.params = { id: 'some-id' };
                request.body = {};
            });

            it('then should throw a "ValidationException" error', () => {
                expect(error).toBeInstanceOf(ValidationException);
                expect(error.message).toEqual(expect.stringContaining('must have at least 1 key'));
            });
        });
    });

    describe('given "delete" method is called', () => {
        let results: boolean;

        beforeEach(async () => {
            results = await groupController.delete(request);
        });

        describe('when service successfully deletes a group', () => {
            const groupId = 'some-id';

            beforeAll(() => {
                request.params = {
                    id: groupId
                };
                when(mockedService.deleteOne(groupId)).thenResolve(true);
            });

            it('then results should contain a list of groups', () => {
                expect(results).toBeTruthy();
            });
        });
    });

    describe('given "addUsersToGroup" method is called', () => {
        let results: boolean;
        let error: Error;

        beforeEach(async () => {
            try {
                results = await groupController.addUsersToGroup(request);
            } catch (err) {
                error = err as Error;
            }
        });

        describe('when request body is correct', () => {
            const usersBody: AddUsersToGroupDTO = {
                userIds: ['a-user-id']
            };
            const groupId = 'some-id';

            beforeAll(() => {
                request.params = { id: groupId };
                request.body = usersBody as Partial<AddUsersToGroupDTO>;

                when(mockedService.addUsersToGroup(groupId, anything())).thenResolve(true);
            });

            it('then results should return true', () => {
                expect(results).toBeTruthy();
            });
        });

        describe('when request is incorrect', () => {
            beforeAll(() => {
                request.params = { id: 'some-id' };
                request.body = {};
            });

            it('then should throw a "ValidationException" error', () => {
                expect(error).toBeInstanceOf(ValidationException);
                expect(error.message).toEqual(expect.stringContaining('is required'));
            });
        });
    });
});
