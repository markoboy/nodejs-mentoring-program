import 'reflect-metadata';

import { ExpressApplication } from '@core/web';
import { AppModule } from 'app.module';
import { Environment } from '@config';

async function main(): Promise<void> {
    Environment.load();

    const application = new ExpressApplication(AppModule);
    await application.setup();

    application.app.listen(Environment.get('port'), () => {
        console.log(`App is listening on http://localhost:${Environment.get('port')}`);
    });
}

main();
