import { IRepositoryMatcher, IRepositoryMatcherField } from '@common/repositories';

export function isRepositoryMatcherField<T>(field?: IRepositoryMatcher<T>): field is IRepositoryMatcherField<T> {
    if (typeof field === 'object') {
        return Object.hasOwnProperty.call(field, 'value');
    }

    return false;
}
