const express = require("express");
const { handleRouteErrors, handleServerErrors } = require("./errors/");
const app = express();

const { getCategories, getReviews } = require("./controllers/app-controllers");

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.use("*", handleRouteErrors);

app.use(handleServerErrors);

module.exports = app;
