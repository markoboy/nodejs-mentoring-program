import { UserEntity } from '@api/users/entities';
import { UserRepository, USER_REPOSITORY_MODEL } from '@api/users/repositories';
import { HashService, UserService } from '@api/users/services';
import { MemoryDatabase } from '@core/database';

async function main(): Promise<void> {
    const database = new MemoryDatabase();
    database.createModel(USER_REPOSITORY_MODEL);
    const userRepo = new UserRepository(database);
    const hashService = new HashService();
    const userService = new UserService(userRepo, hashService);

    const user = await userService.create({
        login: 'aa',
        password: 'aaa1',
        age: 4
    });

    await userService.create({
        login: 'abb',
        password: 'aaa1',
        age: 4
    });

    await userService.create({
        login: 'aaaa',
        password: 'aaa1',
        age: 4
    });

    await userService.create({
        login: 'bb',
        password: 'aaa1',
        age: 4
    });

    console.log('First user: \n', JSON.stringify(await userService.findById(user.id), null, 2));

    const updatedUser = await userService.updateOne(user.id, {
        age: 5
    });
    console.log('Updated user: \n', JSON.stringify(await userService.findById(updatedUser.id), null, 2));

    const users = await userService.getAutoSuggestUsers('bb', 6);
    console.log('Autosuggest users: \n', JSON.stringify(users, null, 2));

    await userService.deleteOne(users[0].id);

    console.log(
        'Find one user: \n',
        await database.getModel<UserEntity>(USER_REPOSITORY_MODEL).find({ isDeleted: true }, { limit: 1 })
    );
}

main();
