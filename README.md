# KYLE'S SUPER AMAZING GAME REVIEW API

## INTRODUCTION

[Kyle's super amazing game review API](https://kyles-super-amazing-game-review-api.onrender.com/api) was built for the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as reddit) which should provide this information to the front end architecture.

The database will be PSQL and interactions are through node-postgres.

## HOW TO RUN LOCALLY

### CLONING

To make a local clone of the API, run `git clone https://github.com/Gohkyle/BE-NC-games-project.git`

## SETUP

### DEPENDENCIES

This project uses a few packages that will need to be installed in ordered to run locally. Please see below for a summary.

| Package     | description                                                               |
| ----------- | ------------------------------------------------------------------------- |
| Express     | back end web application framework for building RESTful APIs with Node.js |
| PostGres    | object-relational database management system                              |
| DotEnv \*   | loads environment variables from .env file to process env                 |
| PG format   | dynamic SQL queries, (used for seeding)                                   |
| Jest        | testing suite                                                             |
| Jest-sorted | required for testing Order_By                                             |
| Supertest   | E2E testing suite                                                         |

- Dotenv Environment Variables
  In order to run this file locally, you will need to create environment variables. This will allow you to access the different databases(nc_games for development and nc_games_test for tests). This will require the dotenv package. Write a .env.development and a .env.test files in the directory ./be-nc-games-project/. Please setup the .env files as stated below:

In the .env.development file:
PGDATABASE=nc_games

In the .env.test file:
PGDATABASE=nc_games_test

To install, run `npm install`.

### SEED A LOCAL DATABASE

The database will need to be setup and seeded first. This can be done by running:
`npm run setup-dbs`
`npm run seed`

### RUN TESTS

Running tests can be done by running:
`npm test`

## MINIMUM VERSIONS

Node: v19.1.0
Postgres: ^8.7.3
