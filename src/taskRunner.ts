import fs from 'fs/promises';
import path from 'path';

/**
 * Get a task's full path if it exists.
 *
 * @param task The task name to get.
 * @returns The task's full path if it exists. Undefined if it doesn't exist.
 */
async function getTaskPath(task: string): Promise<string | undefined> {
    const taskPath = path.resolve(__dirname, task);

    try {
        const folderFiles = await fs.readdir(taskPath);

        const indexPath = folderFiles.find((file) => /index\.[jt]s$/.test(file));

        if (!indexPath) {
            return;
        }

        const fullPath = path.resolve(taskPath, indexPath);

        await fs.stat(fullPath);

        return fullPath;
    } catch (error) {
        return;
    }
}

/**
 * Start the main NodeJS program.
 * @param task The task to run. This will run based on the folder structure.
 */
export async function start(task: string): Promise<void> {
    if (!task) {
        throw new Error('Please provide the task you want to execute!');
    }

    const taskPath = await getTaskPath(task);

    if (!taskPath) {
        throw new Error(`Task: -- ${task} -- does not exist. Check the src folder for available tasks.`);
    }

    const { main } = await import(taskPath);

    if (typeof main !== 'function') {
        throw new Error(
            `Task: -- ${task} -- does not export a main function. Please export a main function in order to boot the task.`
        );
    }

    main();
}
