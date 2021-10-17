/**
 * Write a program that should read a csv file and convert it
 * to JSON using streams so that memory consumption is decreased.
 */
import { resolve } from 'path';
import CSVConverter from './CSVConverter';

const BASE_PATH = resolve(__dirname, '..', '..', 'temp');

const CSV_PATH = resolve(BASE_PATH, 'example.csv');
const JSON_PATH = resolve(BASE_PATH, 'example.json');

export async function main(): Promise<void> {
    const csvConverter = new CSVConverter(CSV_PATH);

    try {
        await csvConverter.toJSON(JSON_PATH);
        console.log(`CSV file: ${CSV_PATH} was successfully converted.`);
        console.log(`It has been stored on ${JSON_PATH}`);
    } catch (error) {
        console.error(error);
    }
}
