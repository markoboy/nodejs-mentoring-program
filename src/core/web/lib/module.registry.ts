import { interfaces } from 'inversify';

import {
    getControllerMetadata,
    getModuleMetadata,
    getRoutesMetadata,
    IControllerDefinition,
    IControllerTarget,
    IExportTarget,
    IImportTarget,
    IModuleDefinition,
    IProviderDefinition,
    IRouteDefinition
} from '@common/decorators';
import { BadRequestException } from '@common/exceptions';
import { isProviderDefinition } from '@common/utils';
import { CORE_TYPES, CORE_INTERFACES } from '@core';

export abstract class ModuleRegistry {
    protected abstract registerController(
        controller: IControllerDefinition,
        routes: IRouteDefinition[],
        container: interfaces.Container
    ): Promise<void> | void;

    /**
     * Registers controllers of each module to the application.
     *
     * @param prefix The prefix of the module registering the controllers
     * @param controllers The controllers of each module
     * @param container The container that the controller will be resolved
     */
    private registerControllers(
        prefix?: string,
        controllers?: IControllerTarget[],
        container?: interfaces.Container
    ): void {
        if (!container) {
            return;
        }

        controllers?.forEach((controller) => {
            const { path, target } = getControllerMetadata(controller);
            const routesMetadata = getRoutesMetadata(controller);

            const controllerPath = prefix && prefix !== '/' ? prefix + path : path;

            if (target && routesMetadata) {
                container.bind(target).toSelf().inRequestScope();

                this.registerController({ path: controllerPath, target }, routesMetadata, container);
            }
        });
    }

    /**
     * Register the provider to the container of the module.
     *
     * @param provider The provider to register
     * @param container The container to register the provider to
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

    /**
     * Registers all providers to the container and exports to the parent container.
     *
     * @param providers The exports and providers to register
     * @param container The container to register providers to
     */
    private registerProviders(
        { exports: exported = [], providers }: Pick<IModuleDefinition, 'exports' | 'providers'>,
        container: interfaces.Container
    ): void {
        providers?.forEach((provider) => {
            this.registerProvider(provider, container);
        });

        exported.forEach((provider) => {
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
                        value: container.get(providerType)
                    },
                    container.parent
                );
            }
        });
    }

    /**
     * Get's the module prefix concatenated from the parent module and current module.
     *
     * @param prefix The module's prefix
     * @param container The container of the module
     * @returns The concatenated prefix of the modules
     */
    private getModulePrefix(prefix: string, container: interfaces.Container): string {
        let modulePrefix = prefix;

        if (container.parent) {
            const parentPrefix = container.parent.get(CORE_TYPES.ModulePrefix);

            if (parentPrefix && parentPrefix !== '/') {
                modulePrefix = parentPrefix + modulePrefix;
            }
        }

        return modulePrefix;
    }

    /**
     * Register the module and it's imported children to the container. Registers
     * modules providers and controllers to be consumed by the application.
     *
     * @param coreModule The module to register
     * @param container The container to register the module to
     */
    public registerModule(coreModule: IImportTarget, container: interfaces.Container): void {
        const { controllers, exports, imports, prefix = '', providers } = getModuleMetadata(coreModule);

        const modulePrefix = this.getModulePrefix(prefix, container);
        container.bind<CORE_INTERFACES.ModulePrefix>(CORE_TYPES.ModulePrefix).toConstantValue(modulePrefix);

        this.registerProviders({ exports, providers }, container);

        if (imports) {
            imports.forEach((importModule) => {
                const childContainer = container.createChild();
                this.registerModule(importModule, childContainer);
            });
        }

        this.registerControllers(modulePrefix, controllers, container);
    }
}
