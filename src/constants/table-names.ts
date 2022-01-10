import { generateManyToManyModel } from '@common/utils';

export const USER_REPOSITORY_MODEL = 'users';

export const PERMISSION_REPOSITORY_MODEL = 'permissions';

export const GROUP_REPOSITORY_MODEL = 'groups';

export const GROUP_PERMISSION_REPOSITORY_MODEL = generateManyToManyModel(
    GROUP_REPOSITORY_MODEL,
    PERMISSION_REPOSITORY_MODEL
);

export const USER_GROUP_REPOSITORY_MODEL = generateManyToManyModel(USER_REPOSITORY_MODEL, GROUP_REPOSITORY_MODEL);
