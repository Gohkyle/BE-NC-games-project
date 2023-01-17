const {
  fetchCategories,
  fetchReviewsByReviewId,
  fetchCommentsByReviewId,
  fetchReviews,
} = require("../models/app-models");

exports.getCategories = (request, response, next) => {
  fetchCategories().then((categories) => {
    response.status(200).send({ categories });
  });
};

exports.getReviews = (request, response, next) => {
  fetchReviews().then((reviews) => {
    response.status(200).send({ reviews });
  });
};

exports.getReviewsByReviewId = (request, response, next) => {
  const { review_id } = request.params;
  fetchReviewsByReviewId(review_id)
    .then((review) => {
      response.status(200).send({ review });
    })
    .catch(next);
};

exports.getCommentsByReviewId = (request, response, next) => {
  const { review_id } = request.params;
  fetchReviewsByReviewId(review_id)
    .then(() => {
      return fetchCommentsByReviewId(review_id);
    })
    .then((comments) => {
      console.log(comments);
      response.status(200).send({ comments });