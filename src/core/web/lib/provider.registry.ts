import { IExportTarget, IModuleDefinition, IProviderDefinition } from '@common/decorators';
import { BadRequestException } from '@common/exceptions';
import { isProviderDefinition } from '@common/utils';
import { interfaces } from 'inversify';

export class ProviderRegistry {
    constructor(private container: interfaces.Container) {}

    /**
     * Registers all providers to the container and exports to the parent container.
     *
     * @param providers The exports and providers to register
     */
    public registerProviders({
        exports: exported = [],
        providers
    }: Pick<IModuleDefinition, 'exports' | 'providers'>): void {
        providers?.forEach((provider) => {
            this.registerProvider(provider, this.container);
        });

        exported.forEach((provider) => {
            this.registerExportedProvider(provider);
        });
    }

    private registerExportedProvider(provider: IExportTarget): void {
        let providerType: IProviderDefinition['type'] | null = null;

        if (isProviderDefinition(provider)) {
            providerType = provider.type;
        } else if (provider) {
            providerType = provider;
        }

        // Register the same instance for the exported dependencies
        if (providerType) {
            this.registerProvider(
                {
                    type: providerType,
                    value: this.container.get(providerType)
                },
                this.container.parent
            );
        }
    }

    /**
     * Register the provider to the container of the module.
     *
     * @param provider The provider to register
     * @param container The container to register provider to
     */
    private registerProvider(provider: IExportTarget, container: interfaces.Container | null): void {
        if (!container || !provider) {
            return;
        }

        if (isProviderDefinition(provider)) {
            if (provider.target) {
                container.bind(provider.type).to(provider.target).inSingletonScope();
            } else if (provider.value) {
                container.bind(provider.type).toConstantValue(provider.value);
            } else {
                throw new BadRequestException(
                    `${String(provider.type)} is not a valid provider. "target" or "value" is required.`
                );
            }
        } else {
            container.bind(provider).toSelf().inSingletonScope();
        }
    }
}
