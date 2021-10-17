import fs from 'fs';
import { pipeline, Transform, TransformCallback, TransformOptions } from 'stream';

import csv from 'csvtojson';

interface ExtendedTransformOptions extends TransformOptions {
    transform?(this: ExtendedTransform, chunk: unknown, encoding: BufferEncoding, callback: TransformCallback): void;
    flush?(this: ExtendedTransform, callback: TransformCallback): void;
}

class ExtendedTransform extends Transform {
    public isNotAtFirstRow = false;

    constructor(opts?: ExtendedTransformOptions) {
        super(opts);
    }
}

export default class CSVConverter {
    /**
     * A transform to convert the CSV to valid JSON as csvtojson package
     * has a bug that adds an extra comma to the last item within the array.
     * https://github.com/Keyang/node-csvtojson/issues/333#issuecomment-561096867
     */
    lineToArrayTransformer = new ExtendedTransform({
        transform(chunk: Buffer, encoding, cb): void {
            // add [ to very front
            // add , between rows
            // remove crlf from row
            const suffix = this.isNotAtFirstRow ? ',' : '[';
            const jsonText = chunk.toString('utf-8').slice(0, -1);

            this.push(`${suffix}${jsonText}`);

            this.isNotAtFirstRow = true;
            cb();
        },
        flush(cb): void {
            // add ] to very end or [] if no rows
            const isEmpty = !this.isNotAtFirstRow;
            this.push(isEmpty ? '[]' : ']');
            cb();
        }
    });

    /**
     * A converter for csv files that can be loaded from file system.
     *
     * @param csvPath The CSV path to process
     */
    constructor(private readonly csvPath: string) {}

    /**
     * Convert a CSV to JSON and store it to the provided output path.
     *
     * @param {string} outputPath The path that the JSON should be saved. It should contain the prefix too.
     * @returns {Promise<void>} Resolves when the csv was saved to the output path successfully.
     */
    toJSON(outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            pipeline(
                fs.createReadStream(this.csvPath),
                csv({
                    downstreamFormat: 'line'
                }),
                this.lineToArrayTransformer,
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
}
