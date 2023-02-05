const reviewsRouter = require("express").Router();

const {
  getReviews,
  getReviewsByReviewId,
  getCommentsByReviewId,
  postCommentOnReviewId,
  patchReview,
  postReview,
  deleteReview,
} = require("../../controllers/app-controllers");

reviewsRouter.route("/").get(getReviews).post(postReview);

reviewsRouter
  .route("/:review_id")
  .get(getReviewsByReviewId)
  .delete(deleteReview);

reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReviewId)
  .post(postCommentOnReviewId);

reviewsRouter.patch("/:review_id", patchReview);

module.exports = reviewsRouter;
