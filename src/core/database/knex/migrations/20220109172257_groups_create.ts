import { generateModelId } from '@common/utils';
import {
    GROUP_PERMISSION_REPOSITORY_MODEL,
    GROUP_REPOSITORY_MODEL,
    PERMISSION_REPOSITORY_MODEL,
    USER_GROUP_REPOSITORY_MODEL,
    USER_REPOSITORY_MODEL
} from '@constants';
import { Knex } from 'knex';

const userId = generateModelId(USER_REPOSITORY_MODEL);
const groupId = generateModelId(GROUP_REPOSITORY_MODEL);
const permissionId = generateModelId(PERMISSION_REPOSITORY_MODEL);

export async function up(knex: Knex): Promise<void> {
    // Group table with many-to-many relation on user table
    await knex.schema.createTableIfNotExists(GROUP_REPOSITORY_MODEL, (table) => {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
        table.string('name').notNullable().unique();
    });

    await knex.schema.createTableIfNotExists(USER_GROUP_REPOSITORY_MODEL, (table) => {
        table.uuid(userId).unsigned();
        table.foreign(userId).references('id').inTable(USER_REPOSITORY_MODEL).onDelete('CASCADE');

        table.uuid(groupId).unsigned();
        table.foreign(groupId).references('id').inTable(GROUP_REPOSITORY_MODEL).onDelete('CASCADE');
    });

    // Permission table with many-to-many relation on group table
    await knex.schema.createTableIfNotExists(PERMISSION_REPOSITORY_MODEL, (table) => {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
        table.string('name').notNullable().unique();
    });

    await knex.schema.createTableIfNotExists(GROUP_PERMISSION_REPOSITORY_MODEL, (table) => {
        table.uuid(groupId).unsigned();
        table.foreign(groupId).references('id').inTable(GROUP_REPOSITORY_MODEL).onDelete('CASCADE');

        table.uuid(permissionId).unsigned();
        table.foreign(permissionId).references('id').inTable(PERMISSION_REPOSITORY_MODEL).onDelete('CASCADE');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(GROUP_PERMISSION_REPOSITORY_MODEL);
    await knex.schema.dropTableIfExists(PERMISSION_REPOSITORY_MODEL);

    await knex.schema.dropTableIfExists(USER_GROUP_REPOSITORY_MODEL);
    await knex.schema.dropTableIfExists(GROUP_REPOSITORY_MODEL);
}
