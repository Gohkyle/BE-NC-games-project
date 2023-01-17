const {
  fetchCategories,
  fetchReviewsByReviewId,
  fetchCommentsByReviewId,
  fetchReviews,
  updateReview,
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
      response.status(200).send({ comments });
    })
    .catch(next);
};

exports.patchReview = (request, response, next) => {
  const { inc_votes } = request.body;
  const { review_id } = request.params;
  updateReview(review_id, inc_votes).then((updatedReview) => {
    response.status(200).send({ updatedReview });
  });
};
