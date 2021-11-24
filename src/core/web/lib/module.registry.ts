import { interfaces } from 'inversify';

import {
    IControllerDefinition,
    IRouteDefinition,
    IControllerTarget,
    getControllerMetadata,
    getRoutesMetadata,
    IExportTarget,
    IModuleDefinition,
    IImportTarget,
    getModuleMetadata
} from '@common/decorators';
import { isProviderDefinition } from '@common/utils';
import { CORE_TYPES } from '@core/core.ioc';

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
        if (!container) {
            return;
        }

        if (isProviderDefinition(provider)) {
            container.bind(provider.type).to(provider.target).inSingletonScope();
        } else {
            container.bind(provider).toSelf().inSingletonScope();
        }
    }

    /**
     * Registers all providers to the container and exports to the parent container.
     *
     * @param param0 The exports and providers to register
     * @param container The container to register providers to
     */
    private registerProviders(
        { exports: exported = [], providers }: Pick<IModuleDefinition, 'exports' | 'providers'>,
        container: interfaces.Container
    ): void {
        providers?.forEach((provider) => {
            if (exported.includes(provider)) {
                this.registerProvider(provider, container.parent);
            } else {
                this.registerProvider(provider, container);
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
        container.bind(CORE_TYPES.ModulePrefix).toConstantValue(modulePrefix);

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
