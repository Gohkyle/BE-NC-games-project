const db = require("../db/connection");

exports.fetchCategories = () => {
  return db.query(`SELECT * FROM categories;`).then(({ rows }) => {
    return rows;
  });
};

exports.fetchReviewsByReviewId = (reviewId) => {
  const queryStr = `
      SELECT * FROM reviews
      WHERE review_id = $1
      ;`;

  return db.query(queryStr, [reviewId]).then(({ rows }) => {
    if (!rows[0]) {
      return Promise.reject({ statusCode: 404, msg: "ID Does Not Exist" });
    }
    return rows[0];
  });
};

exports.fetchCommentsByReviewId = (review_id) => {
  const queryStr = `
        SELECT * FROM comments
        WHERE review_id = $1
        ORDER BY created_at DESC
    ;`;

  return db.query(queryStr, [review_id]).then(({ rows, rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({ statusCode: 404, msg: "Not Found" });
    }
    return rows;
  });
};

exports.fetchReview;
