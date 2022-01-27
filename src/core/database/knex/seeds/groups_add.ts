import { IPermission } from '@api/groups/entities';
import { GROUP_REPOSITORY_MODEL, PERMISSION_REPOSITORY_MODEL } from '@constants';
import { Knex } from 'knex';
import { DELETE, READ, SHARE, WRITE, UPLOAD_FILES } from '@api/groups/constants';

function generatePermissions(): { name: string }[] {
    const values: IPermission[] = [DELETE, READ, SHARE, WRITE, UPLOAD_FILES];

    return values.map((name) => ({ name }));
}

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex(GROUP_REPOSITORY_MODEL).del();
    await knex(PERMISSION_REPOSITORY_MODEL).del();

    // Inserts seed entries
    await knex(PERMISSION_REPOSITORY_MODEL).insert(generatePermissions());
}
