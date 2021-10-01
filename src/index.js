const fs = require('fs');
const path = require('path');

/**
 * Start the main NodeJS program.
 * @param {'task1.1'} task The task to run. This will run based on the folder structure.
 */
exports.start = function start(task) {
  if (!task) {
    throw new Error('Please provide the task you want to execute!');
  }

  const taskPath = path.resolve(__dirname, task, 'index.js');
  const taskExists = fs.existsSync(taskPath);

  if (!taskExists) {
    throw new Error(`Task: -- ${task} -- does not exist. Check the src folder for available tasks.`);
  }

  const taskProgram = require(taskPath);

  if (!Object.hasOwnProperty.call(taskProgram, 'main')) {
    throw new Error(`Task: -- ${task} -- does not export a main function. Please export a main function in order to boot the task.`);
  }

  taskProgram.main();
};
