import readline from 'readline';

export default class QuestionPrompt {
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    /**
     * A promisified version of the ReadLine question.
     *
     * @param {string} query The query to ask the user.
     * @returns {Promise<string>} Returns the answer of the user.
     */
    question(query: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.rl.question(query, (answer) => {
                if (!answer) {
                    reject();
                }

                resolve(answer);
            });
        });
    }
}
