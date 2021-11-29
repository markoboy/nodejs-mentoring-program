import 'reflect-metadata';

import commandLineArgs from 'command-line-args';
import { Knex } from 'knex';

import { Exception } from '@common/exceptions';

import { createKnex, knexConfig } from '.';

interface RunMigrateOptions {
    knex: Knex;
    migrationConfig?: Knex.MigratorConfig;
}

interface CommandLineOptions {
    type: 'latest' | 'rollback' | 'make';
    name?: string;
}

const optionDefinitions: (commandLineArgs.OptionDefinition & { description?: string; typeLabel?: string })[] = [
    {
        name: 'type',
        alias: 't',
        type: String,
        description: 'The migration type to run. Eg. "latest", "rollback", "make"',
        typeLabel: '<string>'
    },
    {
        name: 'name',
        alias: 'n',
        type: String,
        description: 'The migration name to set. Required when "make" is used',
        typeLabel: '<string>'
    }
];

const options = commandLineArgs(optionDefinitions) as CommandLineOptions;

async function executeMigrateLatest({ knex, migrationConfig }: RunMigrateOptions): Promise<void> {
    await knex.migrate.latest(migrationConfig);
}

async function executeMigrateRollback({ knex, migrationConfig }: RunMigrateOptions): Promise<void> {
    await knex.migrate.rollback(migrationConfig);
}

async function executeMigrateMake(name: string, { knex, migrationConfig }: RunMigrateOptions): Promise<void> {
    await knex.migrate.make(name, migrationConfig);
}

async function main(): Promise<void> {
    const knex = createKnex(knexConfig);

    const { type, name } = options;

    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    switch (type) {
        case 'make':
            if (!name) {
                throw new Exception('Please provide the "name" of migration to make');
            }
            await executeMigrateMake(name, { knex, migrationConfig: knexConfig.migrations });
            break;

        case 'latest':
            await executeMigrateLatest({ knex, migrationConfig: knexConfig.migrations });
            break;

        case 'rollback':
            await executeMigrateRollback({ knex, migrationConfig: knexConfig.migrations });
            break;

        default:
            throw new Exception('Please provide the "type" of migration to run');
    }

    await knex.destroy();
}

main();
