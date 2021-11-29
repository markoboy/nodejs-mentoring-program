import { IProviderTargetTypes, IProviderDefinition } from '@common/decorators';

export function isProviderDefinition(definition: IProviderTargetTypes): definition is IProviderDefinition {
    return typeof definition !== 'function';
}
