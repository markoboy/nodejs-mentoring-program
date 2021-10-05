import commandLineArgs from 'command-line-args';

import { start } from './src';

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
const optionDefinitions = [
  {
    name: 'task',
    alias: 't',
    type: String,
    description: 'The task version to process. eg. 1.1',
    typeLabel: '<string>',
  },
];

const options = commandLineArgs(optionDefinitions);

const { task = '1.1' } = options;

start(`task${task}`);
