const {
  fetchCategories,
  fetchReviewsByReviewId,
  fetchCommentsByReviewId,
  fetchReviews,
  addCommentOnReviewId,
  updateReviewVote,
  fetchUsers,
} = require("../models/app-models");

exports.getCategories = (request, response, next) => {
  fetchCategories()
    .then((categories) => {
      response.status(200).send({ categories });
    })
    .catch(next);
};

exports.getReviews = (request, response, next) => {
  const { category, sort_by, order_by } = request.query;
  fetchCategories()
    .then((categories) => {
      return fetchReviews(category, sort_by, order_by, categories);
    })
    .then((reviews) => {
      response.status(200).send({ reviews });
    })
    .catch(next);
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
  const newComment = request.body;
  fetchReviewsByReviewId(review_id)
    .then(() => {
      return addCommentOnReviewId(review_id, newComment);
    })
    .then((postedComment) => {
      response.status(201).send({ postedComment });
    })
    .catch(next);
};

exports.patchReview = (request, response, next) => {
  const updates = request.body;
  const { review_id } = request.params;
  updateReviewVote(review_id, updates)
    .then((updatedReview) => {
      response.status(200).send({ updatedReview });
    })
    .catch(next);
};

exports.getUsers = (request, response, next) => {
  fetchUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch(next);
};
