# NodeJS Mentoring Program

## Available commands

|command          |description                                               |
|-----------------|----------------------------------------------------------|
|`npm run dev`    |It will run the express server with linting               |
|`npm run start`  |It will run the build and start the express server in prod|
|`npm run lint`   |It will run the linting of the project                    |

## Local Database administration

Docker compose is used to run a local instance of Postgres database as well as a database administration dashboard adminer.

When `npm run dev` is executed it will also start the database service and the dashboard. You can navigate to http://localhost:4000/ for managing the database.
