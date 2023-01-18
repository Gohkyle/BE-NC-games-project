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
      return Promise.reject({ statusCode: 404, msg: "ID Not Found" });
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

  return db.query(queryStr, [review_id]).then(({ rows }) => {
    return rows;
  });
};

exports.addCommentOnReviewId = (review_id, newComment) => {
  if (
    newComment.username &&
    newComment.body &&
    Object.keys(newComment).length === 2
  ) {
    const queryStr = `
    INSERT INTO comments
    (author, body, review_id)
    VALUES
    ($1, $2, $3)
    RETURNING *;
    `;
    return db
      .query(queryStr, [newComment.username, newComment.body, review_id])
      .then(({ rows }) => {
        return rows[0].body;
      });
  } else return Promise.reject({ statusCode: 400, msg: "Bad Request" });
};
