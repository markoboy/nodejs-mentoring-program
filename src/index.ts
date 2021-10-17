import commandLineArgs, { OptionDefinition } from 'command-line-args';

import { start } from './taskRunner';

/**
 * Allow to run the file with some command line arguments.
 * The only available argument is the `task` with an alias of `t`.
 * We can define which task we want to execute by defining the task name.
 * It defaults to start the 1.1 task.
 *
 * @example
 * node index.js -t 1.1
 * node index.js --task 1.1
 *
 * @type {import('command-line-args').OptionDefinition[]}
 */
const optionDefinitions: OptionDefinition[] = [
    {
        alias: 't',
        defaultValue: '1.1',
        name: 'task',
        type: String
    }
];

const options = commandLineArgs(optionDefinitions);

const { task } = options;

start(`task${task}`);
