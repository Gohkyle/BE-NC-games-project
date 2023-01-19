const db = require("../db/connection");

exports.fetchCategories = () => {
  const queryStr = `SELECT * FROM categories;`;
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};

exports.fetchReviews = (
  category,
  sort_by = "created_at",
  order_by = "DESC",
  categories
) => {
  const acceptedCategories = categories.map((category) => {
    return category.slug;
  });
  const acceptedSort_by = [
    "title",
    "designer",
    "owner",
    "category",
    "created_at",
    "votes",
  ];

  let queryValues = [];

  if (!acceptedSort_by.includes(sort_by)) {
    return Promise.reject({
      statusCode: 400,
      msg: "Bad Request: Column does not exist!",
    });
  }

  if (!["ASC", "DESC"].includes(order_by.toUpperCase())) {
    return Promise.reject({
      statusCode: 400,
      msg: "Bad Request: ASC or DESC ONLY",
    });
  }

  let queryStr = `
  SELECT reviews.*, CAST(COUNT(comments.review_id) AS INT) AS comment_count
  FROM reviews
  LEFT JOIN comments 
  ON comments.review_id = reviews.review_id 
  `;

  if (category) {
    if (!acceptedCategories.includes(category)) {
      return Promise.reject({
        statusCode: 404,
        msg: "Category Not Found",
      });
    }
    queryStr += `WHERE category = $1 `;
    queryValues.push(category);
  }

  queryStr += `
  GROUP BY reviews.review_id
  ORDER BY reviews.${sort_by} ${order_by};
  `;

  return db.query(queryStr, queryValues).then(({ rows }) => {
    return rows;
  });
};

exports.fetchReviewsByReviewId = (reviewId) => {
  const queryStr = `
    SELECT reviews.*, CAST(COUNT(comments.review_id) AS INT) AS comment_count 
    FROM reviews
    LEFT JOIN comments
    ON reviews.review_id = comments.review_id
    WHERE reviews.review_id = $1
    GROUP BY reviews.review_id
    ;`;

  return db.query(queryStr, [reviewId]).then(({ rows: [row] }) => {
    if (!row) {
      return Promise.reject({ statusCode: 404, msg: "ID Not Found" });
    }
    return row;
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
      .then(({ rows: [{ body }] }) => {
        return body;
      });
  } else return Promise.reject({ statusCode: 400, msg: "Bad Request" });
};

exports.updateReviewVote = (review_id, updates) => {
  if (Object.keys(updates).length === 1 && updates.inc_votes) {
    const queryStr = `
      UPDATE reviews
      SET votes = votes + $1
      WHERE review_id = $2
      RETURNING *;
    `;

    return db
      .query(queryStr, [updates.inc_votes, review_id])
      .then(({ rows: [row] }) => {
        if (!row) {
          return Promise.reject({ statusCode: 404, msg: "ID Not Found" });
        }
        return row;
      });
  } else return Promise.reject({ statusCode: 400, msg: "Bad Request" });
};

exports.fetchUsers = () => {
  const queryStr = `
    SELECT * FROM users
  `;

  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};
