import faker from 'faker';
import { Knex } from 'knex';

const tableName = 'table_name';

function generateValues(count: number): unknown[] {
    const values: unknown[] = [];

    for (let i = 0; i < count; i++) {
        values.push({
            colName: faker.name.firstName()
        });
    }

    return values;
}

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex(tableName).del();

    // Inserts seed entries
    await knex(tableName).insert(generateValues(4));
}
