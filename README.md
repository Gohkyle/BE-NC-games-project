# Northcoders House of Games API

## SETUP

In order to run this file locally, you will need to create environment variables. This will allow you to access the different databases(nc_games for development and nc_games_test for tests). This will require the dotenv package. Write a .env.development and a .env.test files in the directory ./be-nc-games-project/. Please setup the .env files as stated below:

In the .env.development file:
PGDATABASE=nc_games

In the .env.test file:
PGDATABASE=nc_games_test
