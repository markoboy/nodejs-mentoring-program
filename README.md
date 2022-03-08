# NodeJS Mentoring Program

## Available commands

|command              |description                                               |
|---------------------|----------------------------------------------------------|
|`npm run dev`        |It will run the express server with linting               |
|`npm run start`      |It will run the build and start the express server in prod|
|`npm run lint`       |It will run the linting of the project                    |
|`npm run test`       |It will run the tests of the project                      |
|`npm run test:watch` |It will run the test in watch mode of the project         |

## Local Database administration

Docker compose is used to run a local instance of Postgres database as well as a database administration dashboard adminer.

When `npm run dev` is executed it will also start the database service and the dashboard. You can navigate to http://localhost:4000/ for managing the database.

### Knex

Knex is used for database communication from the node server. Migrations and seeds are handled by knex.

The available commands to handle migrations and seeds:

|command                                    |description                                                                 |
|-------------------------------------------|----------------------------------------------------------------------------|
|`npm run migrate:make -n <Migration name>` |It will create a migration file under `./src/core/database/knex/migrations` |
|`npm run migrate:latest`                   |It will run the migrations under `./src/core/database/knex/migrations`      |
|`npm run migrate:rollback`                 |It will rollback the latest migration                                       |
|`npm run seed:make -n <Seed name>`         |It will create a seed file under `./src/core/database/knex/seeds`           |
|`npm run seed:run`                         |It will run the seeds under `./src/core/database/knex/seeds`                |
