import path from 'path';
import knex, { Knex } from 'knex';

import { Environment, loadEnv } from '@config';

loadEnv();

const { pg, db } = Environment.get();

const migrationsDirectory = path.resolve(__dirname, 'migrations');
const migrationStubPath = path.resolve(__dirname, 'migration.stub.ts');

const seedsDirectory = path.resolve(__dirname, 'seeds');
const seedsStubPath = path.resolve(__dirname, 'seed.stub.ts');

export const knexConfig: Knex.Config = {
    client: 'pg',
    version: pg.version,
    connection: {
        host: pg.host,
        port: pg.port,
        user: pg.user,
        password: pg.password,
        database: pg.database
    },
    pool: db.pool,
    debug: db.debug,
    migrations: {
        directory: migrationsDirectory,
        extension: 'ts',
        loadExtensions: ['.ts'],
        stub: migrationStubPath,
        tableName: 'knex_migrations'
    },
    seeds: {
        directory: seedsDirectory,
        extension: 'ts',
        loadExtensions: ['.ts'],
        stub: seedsStubPath
    }
};

export function createKnex<TRecord extends Record<string, unknown> = Record<string, unknown>, TResult = unknown[]>(
    config: Knex.Config = knexConfig
): Knex<TRecord, TResult> {
    return knex<TRecord, TResult>(config);
}
