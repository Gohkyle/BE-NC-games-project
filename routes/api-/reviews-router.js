const reviewsRouter = require("express").Router();

const {
  getReviews,
  getReviewsByReviewId,
  getCommentsByReviewId,
  patchReview,
  postReview,
} = require("../../controllers/app-controllers");

reviewsRouter.route("/").get(getReviews).post(postReview);

reviewsRouter.get("/:review_id", getReviewsByReviewId);

reviewsRouter.route("/:review_id/comments").get(getCommentsByReviewId);

reviewsRouter.patch("/:review_id", patchReview);

module.exports = reviewsRouter;
