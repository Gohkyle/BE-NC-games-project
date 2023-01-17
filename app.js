const express = require("express");
const {
  handleRouteErrors,
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
} = require("./errors/");
const app = express();

const {
  getCategories,
  getCommentsByReviewId,
} = require("./controllers/app-controllers");

app.get("/api/categories", getCategories);

app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);

app.use(handleCustomErrors);

app.use(handlePsqlErrors);

app.use(handleRouteErrors);

app.use(handleServerErrors);

module.exports = app;
