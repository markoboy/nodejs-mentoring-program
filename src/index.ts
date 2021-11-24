import 'reflect-metadata';

import { ExpressApplication } from '@core/web';
import { getEnvNumber } from '@common/utils';
import { AppModule } from 'app.module';

async function main(): Promise<void> {
    const application = new ExpressApplication(AppModule);
    await application.setup();

    const PORT = getEnvNumber('PORT', 3000);

    application.app.listen(PORT, () => {
        console.log(`App is listening on http://localhost:${PORT}`);
    });
}

main();
