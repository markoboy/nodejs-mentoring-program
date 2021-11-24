import knex, { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';
import { getEnvBoolean, getEnvNumber } from '@common/utils';

dotenv.config({ path: path.resolve(process.cwd(), '.dev.env') });

const migrationsDirectory = path.resolve(__dirname, 'migrations');
const migrationStubPath = path.resolve(__dirname, 'migration.stub.ts');

const seedsDirectory = path.resolve(__dirname, 'seeds');
const seedsStubPath = path.resolve(__dirname, 'seed.stub.ts');

export const knexConfig: Knex.Config = {
    client: 'pg',
    version: process.env.PG_VERSION,
    connection: {
        host: process.env.PG_HOST,
        port: getEnvNumber('PG_PORT', 5432),
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE
    },
    pool: {
        min: getEnvNumber('DB_POOL_MIN', 2),
        max: getEnvNumber('DB_POOL_MAX', 10)
    },
    debug: getEnvBoolean('DB_DEBUG'),
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
