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
  ORDER BY reviews.created_at ASC;
  `;
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};
