import 'reflect-metadata';

import { ExpressApplication } from '@core/web';
import { AppModule } from 'app.module';
import { Environment } from '@config';
import { ConcreteLogger } from '@core/logger';
import { ProcessExceptionService } from 'process-exception.service';

async function main(): Promise<void> {
    Environment.load();

    const logEnv = Environment.get('log');
    const logger = new ConcreteLogger({ level: logEnv.level, logPath: logEnv.path, useConsole: logEnv.console });

    const application = new ExpressApplication(AppModule, {
        logger
    });
    await application.setup();

    const server = application.app.listen(Environment.get('port'), () => {
        logger.info(`App is listening on http://localhost:${Environment.get('port')}`);
    });

    const processExceptionService = application.getContainer().resolve(ProcessExceptionService);
    processExceptionService.handleUncaughtException(() => {
        return new Promise((resolve, reject) => {
            server.close((err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    });

    processExceptionService.handleUnhandledRejection();
}

main();
