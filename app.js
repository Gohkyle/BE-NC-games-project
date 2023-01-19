const express = require("express");
const app = express();

const {
  handleRouteErrors,
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
} = require("./errors/");

const {
  getCategories,
  getReviews,
  getReviewsByReviewId,
  getCommentsByReviewId,
  postCommentOnReviewId,
  patchReview,
  getUsers,
  deleteComment,
   getApiEndpoints,
} = require("./controllers/app-controllers");

app.use(express.json());

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReviewsByReviewId);

app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);

app.post("/api/reviews/:review_id/comments", postCommentOnReviewId);

app.patch("/api/reviews/:review_id", patchReview);

app.get("/api/users", getUsers);

app.delete("/api/comments/:comment_id", deleteComment);

app.get("/api", getApiEndpoints);

app.use(handleRouteErrors);

app.use(handleCustomErrors);

app.use(handlePsqlErrors);

app.use(handleServerErrors);

module.exports = app;
