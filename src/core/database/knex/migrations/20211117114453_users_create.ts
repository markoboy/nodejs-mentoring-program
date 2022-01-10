import { USER_REPOSITORY_MODEL } from '@constants';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTableIfNotExists(USER_REPOSITORY_MODEL, (table) => {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
        table.boolean('isDeleted').defaultTo(false);
        table.string('login').notNullable().unique();
        table.string('password').notNullable();
        table.integer('age', 100).notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(USER_REPOSITORY_MODEL);
}
