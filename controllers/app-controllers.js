const {
  fetchCategories,
  fetchReviewsByReviewId,
  fetchCommentsByReviewId,
  fetchReviews,
  addCommentOnReviewId,
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

exports.postCommentOnReviewId = (request, response, next) => {
  const { review_id } = request.params;
  const { username, body } = request.body;
  fetchReviewsByReviewId(review_id)
    .then(() => {
      return addCommentOnReviewId(review_id, username, body);
    })
    .then((postedComment) => {
      response.status(201).send({ postedComment });
    })
    .catch(next);
};
