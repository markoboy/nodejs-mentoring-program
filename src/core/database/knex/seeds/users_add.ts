import { IUserEntity, UserEntity } from '@api/users/entities';
import { HashService } from '@api/users/services';
import { USER_REPOSITORY_MODEL } from '@constants';
import faker from 'faker';
import { Knex } from 'knex';

async function generateUsers(count: number): Promise<Partial<IUserEntity>[]> {
    const hashService = new HashService();

    let { id, ...user } = await UserEntity.create(
        {
            login: 'admin',
            password: 'admin',
            age: 28
        },
        hashService.hash
    );

    const users: Partial<IUserEntity>[] = [user];

    for (let i = 0; i < count; i++) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ id, ...user } = await UserEntity.create(
            {
                login: faker.internet.userName(),
                password: faker.internet.password(),
                age: faker.datatype.number({ min: 4, max: 130 })
            },
            hashService.hash
        ));

        users.push(user);
    }

    return users;
}

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex(USER_REPOSITORY_MODEL).del();

    // Inserts seed entries
    await knex<IUserEntity>(USER_REPOSITORY_MODEL).insert(await generateUsers(2));
}
