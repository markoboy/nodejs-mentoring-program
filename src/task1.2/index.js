/**
 * Write a program that should read a csv file and convert it
 * to JSON using streams so that memory consumption is decreased.
 */
import fs from 'fs';
import { resolve } from 'path';
import { pipeline, Transform } from 'stream';

import csv from 'csvtojson';

const BASE_PATH = resolve(__dirname, '..', '..', 'temp');

const CSV_PATH = resolve(BASE_PATH, 'example.csv');
const JSON_PATH = resolve(BASE_PATH, 'example.json');

/**
 * Convert a CSV to JSON and store it to the provided output path.
 *
 * @param {string} csvPath The path to the csv file.
 * @param {string} outputPath The path that the JSON should be saved. It should contain the prefix too.
 * @returns {Promise<void>} Resolves when the csv was saved to the output path successfully.
 */
function convertCsvToJson(csvPath, outputPath) {
  /**
   * A transform to convert the CSV to valid JSON as csvtojson package
   * has a bug that adds an extra comma to the last item within the array.
   * https://github.com/Keyang/node-csvtojson/issues/333#issuecomment-561096867
   */
  const lineToArray = new Transform({
    transform(chunk, encoding, cb) {
      // add [ to very front
      // add , between rows
      // remove crlf from row
      const suffix = this.isNotAtFirstRow ? ',' : '[';
      const jsonText = chunk.toString('utf-8').slice(0, -1);

      this.push(`${suffix}${jsonText}`);

      this.isNotAtFirstRow = true;
      this.hasContent = true;
      cb();
    },
    flush(cb) {
      // add ] to very end or [] if no rows
      const isEmpty = !this.isNotAtFirstRow;
      this.push(isEmpty ? '[]' : ']');
      cb();
    },
  });

  return new Promise((resolve, reject) => {
    pipeline(
      fs.createReadStream(csvPath),
      csv({
        downstreamFormat: 'line',
      }),
      lineToArray,
      fs.createWriteStream(outputPath),
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

export async function main() {
  try {
    await convertCsvToJson(CSV_PATH, JSON_PATH);
    console.log(`CSV file: ${CSV_PATH} was successfully converted.`);
    console.log(`It has been stored on ${JSON_PATH}`);
  } catch (error) {
    console.error(error);
  }
}
