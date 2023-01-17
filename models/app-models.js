const db = require("../db/connection");

exports.fetchCategories = () => {
  const queryStr = `SELECT * FROM categories;`;
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};

exports.fetchReviews = () => {
  const queryStr = `
  SELECT reviews.*, COUNT(comments.review_id) AS comment_count 
  FROM reviews 
  LEFT JOIN comments 
  ON comments.review_id = reviews.review_id 
  GROUP BY reviews.review_id
  ORDER BY reviews.created_at DESC;
  `;
  return db.query(queryStr).then(({ rows }) => {
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

