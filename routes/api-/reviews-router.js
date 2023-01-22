const reviewsRouter = require("express").Router();

const {
  getReviews,
  getReviewsByReviewId,
  getCommentsByReviewId,
  postCommentOnReviewId,
  patchReview,
} = require("../../controllers/app-controllers");

reviewsRouter.route("/").get(getReviews);


reviewsRouter.get("/:review_id", getReviewsByReviewId);

reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReviewId)
  .post(postCommentOnReviewId);

reviewsRouter.patch("/:review_id", patchReview);

module.exports = reviewsRouter;
