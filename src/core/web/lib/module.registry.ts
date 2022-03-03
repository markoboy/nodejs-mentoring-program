import { interfaces } from 'inversify';

import { getModuleMetadata, IImportTarget } from '@common/decorators';
import { CORE_INTERFACES, CORE_TYPES } from '@core';
import { ProviderRegistry } from './provider.registry';

export abstract class ModuleRegistry {
    protected providerRegistry: ProviderRegistry = new ProviderRegistry(this.container);

    constructor(protected container: interfaces.Container) {}

    protected abstract createModule(container: interfaces.Container): ModuleRegistry;

    /**
     * Register the module and it's imported children to the container. Registers
     * modules providers to be consumed by the application.
     *
     * @param coreModule The module to register
     */
    public registerModule(coreModule: IImportTarget): void {
        const { exports, imports, prefix = '', providers } = getModuleMetadata(coreModule);

        const modulePrefix = this.getModulePrefix(prefix);
        this.container.bind<CORE_INTERFACES.ModulePrefix>(CORE_TYPES.ModulePrefix).toConstantValue(modulePrefix);

        const logger = this.container.get<CORE_INTERFACES.Logger>(CORE_TYPES.Logger);
        logger.debug('Registering module', {
            name: coreModule.name,
            isChildModule: !!this.container.parent,
            modulePrefix
        });

        this.providerRegistry.registerProviders({ exports, providers });

        if (imports) {
            imports.forEach((importModule) => {
                const childContainer = this.container.createChild();

                const moduleRegistry = this.createModule(childContainer);
                moduleRegistry.registerModule(importModule);
            });
        }
    }

    /**
     * Get's the module prefix concatenated from the parent module and current module.
     *
     * @param prefix The module's prefix
     * @returns The concatenated prefix of the modules
     */
    protected getModulePrefix(prefix: string): string {
        let modulePrefix = prefix;

        if (this.container.parent) {
            const parentPrefix = this.container.parent.get(CORE_TYPES.ModulePrefix);

            if (parentPrefix && parentPrefix !== '/') {
                modulePrefix = parentPrefix + modulePrefix;
            }
        }

        return modulePrefix;
    }
}
