import 'reflect-metadata';

import commandLineArgs from 'command-line-args';
import { Knex } from 'knex';

import { Exception } from '@common/exceptions';

import { createKnex, knexConfig } from '.';

interface RunSeedOptions {
    knex: Knex;
    seedConfig?: Knex.SeederConfig;
}

interface CommandLineOptions {
    type: 'run' | 'make';
    name?: string;
}

const optionDefinitions: (commandLineArgs.OptionDefinition & { description?: string; typeLabel?: string })[] = [
    {
        name: 'type',
        alias: 't',
        type: String,
        description: 'The seed type to run. Eg. "run", "make"',
        typeLabel: '<string>'
    },
    {
        name: 'name',
        alias: 'n',
        type: String,
        description: 'The seed name to set. Required when "make" is used',
        typeLabel: '<string>'
    }
];

const options = commandLineArgs(optionDefinitions) as CommandLineOptions;

async function executeSeedRun({ knex, seedConfig }: RunSeedOptions): Promise<void> {
    await knex.seed.run(seedConfig);
}

async function executeSeedMake(name: string, { knex, seedConfig }: RunSeedOptions): Promise<void> {
    await knex.seed.make(name, seedConfig);
}

async function main(): Promise<void> {
    const knex = createKnex(knexConfig);

    const { type, name } = options;

    switch (type) {
        case 'make':
            if (!name) {
                throw new Exception('Please provide the "name" of seed to make');
            }
            await executeSeedMake(name, { knex, seedConfig: knexConfig.seeds });
            break;

        case 'run':
            await executeSeedRun({ knex, seedConfig: knexConfig.seeds });
            break;

        default:
            throw new Exception('Please provide the "type" of seed to run');
    }

    await knex.destroy();
}

main();
