import { IUserEntity, UserEntity } from '@api/users/entities';
import { HashService } from '@api/users/services';
import faker from 'faker';
import { Knex } from 'knex';

const tableName = 'users';

async function generateUsers(count: number): Promise<IUserEntity[]> {
    const hashService = new HashService();

    let { id, ...user } = await UserEntity.create(
        {
            login: 'admin',
            password: 'admin',
            age: 28
        },
        hashService.hash
    );

    const users: IUserEntity[] = [user];

    for (let i = 0; i < count; i++) {
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
    await knex(tableName).del();

    // Inserts seed entries
    await knex<IUserEntity>(tableName).insert(await generateUsers(2));
}
