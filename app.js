const express = require("express");

const {
  handleRouteErrors,
  handleCustomErrors,
  handleServerErrors,
  handlePsqlErrors,
} = require("./errors/");
const app = express();

const {
  getCategories,
  getReviews,
  getReviewsByReviewId,
} = require("./controllers/app-controllers");

app.use(express.json());

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReviewsByReviewId);

app.use(handleRouteErrors);

app.use(handleCustomErrors);

app.use(handlePsqlErrors);

app.use(handleServerErrors);

module.exports = app;
