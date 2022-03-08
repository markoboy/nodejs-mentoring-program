import { anything, instance, mock, reset, when } from 'ts-mockito';

import { ValidationException } from '@common/exceptions';
import { HttpRequest } from '@common/controllers';

import { AuthService, IUserSafe, UserService } from '../services';
import { UserController } from './user.controller';
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from '../dtos';

describe('User controller', () => {
    const mockedService: UserService = mock(UserService);
    const userService: UserService = instance(mockedService);

    const mockedAuthService: AuthService = mock(AuthService);
    const authService: AuthService = instance(mockedAuthService);

    const userController = new UserController(userService, authService);

    const mockedRequest: HttpRequest = mock<HttpRequest>();
    let request = instance(mockedRequest);

    afterEach(() => {
        reset(mockedService);

        const mockedRequest2: HttpRequest = mock<HttpRequest>();
        request = instance(mockedRequest2);
    });

    describe('given "create" method is called', () => {
        let results: IUserSafe;
        let error: Error;

        beforeEach(async () => {
            try {
                results = await userController.create(request);
            } catch (err) {
                error = err as Error;
            }
        });

        describe('when request body is correct', () => {
            const userBody: CreateUserDTO = {
                age: 18,
                login: 'admin',
                password: 'agr34tpwd'
            };
            const userId = 'some-id';

            beforeAll(() => {
                request.body = userBody as Partial<CreateUserDTO>;

                when(mockedService.create(anything())).thenResolve({
                    id: userId,
                    age: userBody.age,
                    isDeleted: false,
                    login: userBody.login
                });
            });

            it('then results should contain the created user', () => {
                expect(results).toEqual({
                    id: userId,
                    age: userBody.age,
                    isDeleted: false,
                    login: userBody.login
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

    describe('given "getAutoSuggest" method is called', () => {
        let results: IUserSafe[];
        let error: Error;

        beforeEach(async () => {
            try {
                results = await userController.getAutoSuggest(request);
            } catch (err) {
                error = err as Error;
            }
        });

        describe('when a substring query is given', () => {
            const foundUser: IUserSafe = {
                id: 'userId',
                age: 18,
                isDeleted: false,
                login: 'user-login'
            };

            beforeAll(() => {
                request.query = {
                    loginSubstring: foundUser.login,
                    limit: 1
                };

                when(mockedService.getAutoSuggestUsers(foundUser.login, 1)).thenResolve([foundUser]);
            });

            it('then results should contain a list of users', () => {
                expect(results).toEqual([foundUser]);
            });
        });

        describe('when request is incorrect', () => {
            beforeAll(() => {
                request.query = {};
            });

            it('then should throw a "ValidationException" error', () => {
                expect(error).toBeInstanceOf(ValidationException);
                expect(error.message).toEqual(expect.stringContaining('is required'));
            });
        });
    });

    describe('given "findOne" method is called', () => {
        let results: IUserSafe;

        beforeEach(async () => {
            results = await userController.findOne(request);
        });

        describe('when service responds with a user', () => {
            const foundUser: IUserSafe = {
                id: 'userId',
                age: 18,
                isDeleted: false,
                login: 'user-login'
            };

            beforeAll(() => {
                request.params = {
                    id: foundUser.id
                };
                when(mockedService.findById(foundUser.id)).thenResolve(foundUser);
            });

            it('then results should contain a user', () => {
                expect(results).toEqual(foundUser);
            });
        });
    });

    describe('given "update" method is called', () => {
        let results: boolean;
        let error: Error;

        beforeEach(async () => {
            try {
                results = await userController.update(request);
            } catch (err) {
                error = err as Error;
            }
        });

        describe('when request body is correct', () => {
            const userBody: UpdateUserDTO = {
                age: 18,
                login: 'admin',
                password: 'agr34tpwd'
            };
            const userId = 'some-id';

            beforeAll(() => {
                request.params = { id: userId };
                request.body = userBody as Partial<UpdateUserDTO>;

                when(mockedService.updateOne(userId, anything())).thenResolve(true);
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
            results = await userController.delete(request);
        });

        describe('when service successfully deletes a user', () => {
            const userId = 'some-id';

            beforeAll(() => {
                request.params = {
                    id: userId
                };
                when(mockedService.deleteOne(userId)).thenResolve(true);
            });

            it('then results should return true', () => {
                expect(results).toBeTruthy();
            });
        });
    });

    describe('given "login" method is called', () => {
        let results: string;
        let error: Error;

        beforeEach(async () => {
            try {
                results = await userController.login(request);
            } catch (err) {
                error = err as Error;
            }
        });

        describe('when request body is correct', () => {
            const loginBody: LoginUserDTO = {
                login: 'some-login',
                password: 'ap4ssw0rd'
            };

            beforeAll(() => {
                request.body = loginBody as Partial<LoginUserDTO>;

                when(mockedAuthService.signJWTToken(anything())).thenResolve('some-token');
            });

            it('then results should return a token', () => {
                expect(results).toBe('some-token');
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
});
