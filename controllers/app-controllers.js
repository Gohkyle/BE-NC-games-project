const {
  fetchCategories,
  fetchReviewsByReviewId,
  fetchCommentsByReviewId,
  fetchReviews,
  addCommentOnReviewId,
  updateReviewVote,
  fetchUsers,
  removeComment,
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
  fetchUsers().then((users) => {
    response.status(200).send({ users });
  });
};

exports.deleteComment = (request, response, next) => {
  const { comment_id } = request.params;
  console.log(comment_id);
  removeComment(comment_id)
    .then(() => {
      response.status(204).send();
    })
    .catch(next);
};
