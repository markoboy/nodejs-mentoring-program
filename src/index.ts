import 'reflect-metadata';
import { ExpressApplication } from '@core/web';

async function main(): Promise<void> {
    const application = new ExpressApplication();
    application.app.listen(3000, () => {
        console.log('App is listening on http://localhost:3000');
    });
}

main();
