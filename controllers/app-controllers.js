const {
  fetchCategories,
  fetchReviewsbyReviewId,
  fetchCommentsByReviewId,
  fetchReviewsByReviewId,
} = require("../models/app-models");

exports.getCategories = (request, response, next) => {
  fetchCategories().then((categories) => {
    response.status(200).send({ categories });
  });
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
    })
    .catch(next);
};
