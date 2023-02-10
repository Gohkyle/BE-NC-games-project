const {
  fetchCategories,
  fetchReviewsByReviewId,
  fetchCommentsByReviewId,
  fetchReviews,
  addCommentOnReviewId,
  updateReviewVote,
  fetchUsers,
  removeComment,
  fetchApiEndpoints,
  fetchUsersByUserId,
  updateCommentVote,
  addReview,
  addCategory,
  removeReview,
} = require("../models/app-models");

exports.getCategories = (request, response, next) => {
  fetchCategories()
    .then((categories) => {
      response.status(200).send({ categories });
    })
    .catch(next);
};

exports.getReviews = (request, response, next) => {
  const { category, sort_by, order_by, limit, p } = request.query;
  fetchCategories()
    .then((categories) => {
      return fetchReviews(category, sort_by, order_by, categories, limit, p);
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
  const { limit, p } = request.query;
  fetchReviewsByReviewId(review_id)
    .then(() => {
      return fetchCommentsByReviewId(review_id, limit, p);
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

exports.deleteComment = (request, response, next) => {
  const { comment_id } = request.params;
  removeComment(comment_id)
    .then((deletedComment) => {
      response.status(204).send({ deletedComment });
    })
    .catch(next);
};
exports.getApiEndpoints = (request, response, next) => {
  fetchApiEndpoints()
    .then((endpoints) => {
      response.status(200).send({ endpoints });
    })
    .catch(next);
};

exports.getUsersByUserId = (request, response, next) => {
  const { username } = request.params;

  fetchUsersByUserId(username)
    .then((user) => {
      response.status(200).send({ user });
    })
    .catch(next);
};

exports.patchComment = (request, response, next) => {
  const { comment_id } = request.params;
  const updates = request.body;
  updateCommentVote(comment_id, updates)
    .then((updatedComment) => {
      response.status(200).send({ updatedComment });
    })
    .catch(next);
};

exports.postReview = (request, response, next) => {
  const requestBody = request.body;
  addReview(requestBody)
    .then((postedReview) => {
      response.status(201).send({ postedReview });
    })
    .catch(next);
};

exports.postCategory = (request, response, next) => {
  const requestBody = request.body;
  addCategory(requestBody)
    .then((postedCategory) => {
      response.status(201).send({ postedCategory });
    })
    .catch(next);
};

exports.deleteReview = (request, response, next) => {
  const { review_id } = request.params;
  fetchReviewsByReviewId(review_id)
    .then(() => {
      return removeReview(review_id);
    })
    .then((content) => {
      response.status(204).send(content);
    })
    .catch(next);
};
