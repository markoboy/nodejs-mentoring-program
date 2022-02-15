import { Inject, Provider } from '@common/decorators';
import { CORE_INTERFACES, CORE_TYPES } from '@core';

@Provider()
export class ProcessExceptionService {
    constructor(
        @Inject(CORE_TYPES.Logger) private logger: CORE_INTERFACES.Logger,
        @Inject(CORE_TYPES.DatabaseDriver) private db: CORE_INTERFACES.DatabaseDriver
    ) {}

    handleUncaughtException(cleanUp: () => Promise<void>): void {
        process.on('uncaughtException', async (error) => {
            this.logger.error('An uncaught exception occurred:', error);

            try {
                await cleanUp();
                await this.db.destroy();

                process.exit(0);
            } catch (err) {
                this.logger.error('Server could not be closed gracefully:', err);

                process.exit(1);
            }
        });
    }

    handleUnhandledRejection(): void {
        process.on('unhandledRejection', (error) => {
            this.logger.error('An unhandled rejection occurred:', error);
        });
    }
}
