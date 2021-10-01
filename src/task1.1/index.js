/**
 * Write a program which reads a string from the standard input stdin, reverses it
 * and then writes it to the standard output stdout.
 */
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * A promisified version of the ReadLine question.
 *
 * @param {string} query The query to ask the user.
 * @returns {Promise<string>} Returns the answer of the user.
 */
const question = (query) =>
  new Promise((resolve, reject) =>
    rl.question(query, (answer) => {
      if (!answer) {
        reject();
      }

      resolve(answer);
    })
  );

/**
 * The main function to start the program.
 * It will continuously ask a user to provide an input that will be reversed.
 */
export async function main() {
  try {
    const answer = await question('What do you want me to reverse?\n');

    console.log('\nYour reversed answer is:');
    console.log(`${answer.split('').reverse().join('')}\n`);
  } catch (error) {
    console.error('Please provide an input.');
  } finally {
    main();
  }
}
