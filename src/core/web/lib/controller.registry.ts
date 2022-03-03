import { interfaces } from 'inversify';

import {
    getControllerMetadata,
    getRoutesMetadata,
    IControllerDefinition,
    IControllerTarget,
    IRouteDefinition
} from '@common/decorators';

export abstract class ControllerRegistry {
    constructor(protected container: interfaces.Container) {}

    /**
     * Registers controllers of each module to the application.
     *
     * @param controllers The controllers of each module
     */
    public registerControllers(controllers: IControllerTarget[]): void {
        controllers.forEach((controller) => {
            const { path, target } = getControllerMetadata(controller);
            const routesMetadata = getRoutesMetadata(controller);

            if (target && routesMetadata) {
                this.container.bind(target).toSelf().inRequestScope();

                this.registerController({ path, target }, routesMetadata);
            }
        });
    }

    protected abstract registerController(
        controller: IControllerDefinition,
        routes: IRouteDefinition[]
    ): Promise<void> | void;
}
