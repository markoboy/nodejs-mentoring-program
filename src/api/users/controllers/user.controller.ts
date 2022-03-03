import { HttpRequest } from '@common/controllers';
import { Controller, Delete, Get, HttpStatus, Patch, Post } from '@common/decorators';

import { CreateUserDTO, FindOneUserDTO, GetSuggestedUsersDTO, LoginUserDTO, UpdateUserDTO } from '../dtos';
import { AuthService, IUserSafe, UserService } from '../services';

@Controller('/users')
export class UserController {
    constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

    @Post('/', HttpStatus.CREATED)
    async create(httpRequest: HttpRequest): Promise<IUserSafe> {
        const createUser = await CreateUserDTO.from(httpRequest.body);

        return this.userService.create(createUser);
    }

    @Get('/auto-suggest')
    async getAutoSuggest(httpRequest: HttpRequest): Promise<IUserSafe[]> {
        const { loginSubstring, limit } = await GetSuggestedUsersDTO.from(httpRequest.query);

        return this.userService.getAutoSuggestUsers(loginSubstring, limit);
    }

    @Get('/:id')
    async findOne(httpRequest: HttpRequest): Promise<IUserSafe> {
        const { id } = await FindOneUserDTO.from(httpRequest.params);

        return this.userService.findById(id);
    }

    @Patch('/:id')
    async update(httpRequest: HttpRequest): Promise<boolean> {
        const { id } = await FindOneUserDTO.from(httpRequest.params);
        const updateUser = await UpdateUserDTO.from(httpRequest.body);

        return this.userService.updateOne(id, updateUser);
    }

    @Delete('/:id')
    async delete(httpRequest: HttpRequest): Promise<boolean> {
        const { id } = await FindOneUserDTO.from(httpRequest.params);

        return this.userService.deleteOne(id);
    }

    @Post('/login')
    async login(httpRequest: HttpRequest): Promise<string> {
        const loginUser = await LoginUserDTO.from(httpRequest.body);

        return this.authService.signJWTToken(loginUser);
    }
}
