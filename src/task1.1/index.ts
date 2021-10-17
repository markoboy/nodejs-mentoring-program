/**
 * Write a program which reads a string from the standard input stdin, reverses it
 * and then writes it to the standard output stdout.
 */
import QuestionPrompt from './QuestionPrompt';

const questionPrompt = new QuestionPrompt();

/**
 * The main function to start the program.
 * It will continuously ask a user to provide an input that will be reversed.
 */
export async function main(): Promise<void> {
    try {
        const answer = await questionPrompt.question('What do you want me to reverse?\n');

        console.log('\nYour reversed answer is:');
        console.log(`${answer.split('').reverse().join('')}\n`);
    } catch (error) {
        console.error('Please provide an input.');
    } finally {
        main();
    }
}
