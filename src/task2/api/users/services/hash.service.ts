import crypto from 'crypto';
import { promisify } from 'util';

import { HashUserPassword } from '../entities';

const randomBytes = promisify(crypto.randomBytes).bind(crypto);
const scrypt = promisify(crypto.scrypt).bind(crypto);

export interface IHashService {
    hash: HashUserPassword;

    verify(password: string, hash: string): Promise<boolean>;
}

export class HashService implements IHashService {
    /**
     * Hash a password into a tuple of salt:hash using crypto scrypt algorithm.
     *
     * @param password The password to hash
     * @returns A tuple of salt:hash
     */
    async hash(password: string): Promise<string> {
        const salt = (await randomBytes(8)).toString('hex');

        const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

        return `${salt}:${derivedKey.toString('hex')}`;
    }

    /**
     * Compares a password with a hash string to verify if they are correct
     * using crypto scrypt algorithm.
     *
     * @param password The password to verify
     * @param hash The current generated hash to compare
     * @returns If the password is correct
     */
    async verify(password: string, hash: string): Promise<boolean> {
        // Extract salt and hash key from the provided hash
        const [salt, key] = hash.split(':');

        // Convert hash to a buffer
        const keyBuffer = Buffer.from(key, 'hex');

        const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

        return crypto.timingSafeEqual(keyBuffer, derivedKey);
    }
}
