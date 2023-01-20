const express = require("express");
const app = express();

const { apiRouter } = require("./routes/api-router");

const {
  handleRouteErrors,
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
} = require("./errors/");

app.use(express.json());

app.use("/api", apiRouter);

app.use(handleRouteErrors);

app.use(handleCustomErrors);

app.use(handlePsqlErrors);

app.use(handleServerErrors);

module.exports = app;
