const db = require("../db/connection");
const fs = require("fs/promises");
const format = require("pg-format");

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
  categories,
  limit = 10,
  p = 1
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
    "comment_count",
  ];

  let queryValues = [limit, limit * (p - 1)];

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
  SELECT 
  reviews.*,
  CAST(COUNT(comments.review_id) AS INT) AS comment_count,
  CAST(COUNT(*) OVER() AS INT) AS total_count
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
    queryStr += `WHERE category = $3 `;
    queryValues.push(category);
  }

  queryStr += `
  GROUP BY reviews.review_id
  ORDER BY ${sort_by} ${order_by}
  OFFSET $2 ROWS FETCH NEXT $1 ROWS ONLY
  ;`;

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
      return Promise.reject({ statusCode: 404, msg: "Review Not Found" });
    }
    return row;
  });
};

exports.fetchCommentsByReviewId = (review_id, limit = 10, p = 1) => {
  const queryValues = [review_id, limit, limit * (p - 1)];

  const queryStr = `
        SELECT * FROM comments
        WHERE review_id = $1
        ORDER BY created_at DESC
        OFFSET $3 ROWS FETCH NEXT $2 ROWS ONLY
    ;`;

  return db.query(queryStr, queryValues).then(({ rows }) => {
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
          return Promise.reject({ statusCode: 404, msg: "Review Not Found" });
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

exports.removeComment = (comment_id) => {
  const queryStr = `
    DELETE FROM comments
    WHERE comment_id = $1
    RETURNING * 
  `;

  return db.query(queryStr, [comment_id]).then(({ rows: [row] }) => {
    if (!row) {
      return Promise.reject({
        statusCode: 400,
        msg: "Bad Request: Comment does not exist!",
      });
    }
    return row;
  });
};

exports.fetchApiEndpoints = () => {
  return fs.readFile("./endpoints.json", "utf-8").then((content) => {
    return JSON.parse(content);
  });
};

exports.fetchUsersByUserId = (username) => {
  const queryStr = `
    SELECT * FROM users
    WHERE username = $1
  ;`;
  return db.query(queryStr, [username]).then(({ rows: [row] }) => {
    if (!row) {
      return Promise.reject({ statusCode: 404, msg: "Username Not Found" });
    }
    return row;
  });
};

exports.updateCommentVote = (comment_id, updates) => {
  if (
    Object.keys(updates).length !== 1 ||
    !updates.hasOwnProperty("inc_votes")
  ) {
    return Promise.reject({
      statusCode: 400,
      msg: "Bad Request Body",
    });
  }
  const queryStr = `
    UPDATE comments
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *
  ;`;

  return db
    .query(queryStr, [updates.inc_votes, comment_id])
    .then(({ rows: [row] }) => {
      if (!row) {
        return Promise.reject({ statusCode: 404, msg: "Comment Not Found" });
      }
      return row;
    });
};

exports.addReview = (requestBody) => {
  const { title, designer, owner, review_img_url, review_body, category } =
    requestBody;

  const queryValues = [title, designer, owner, review_body, category];

  if (queryValues.includes(undefined)) {
    return Promise.reject({ statusCode: 400, msg: "Bad Request" });
  }

  let queryStr = `
  INSERT INTO reviews
  (title, designer, owner, review_body, category`;

  if (review_img_url) {
    queryStr += `, review_img_url`;
    queryValues.push(review_img_url);
  }

  if (
    Object.keys(requestBody).includes("review_img_url") &&
    Object.keys(requestBody).length !== 6
  ) {
    return Promise.reject({ statusCode: 400, msg: "Bad Request" });
  }
  if (
    !Object.keys(requestBody).includes("review_img_url") &&
    Object.keys(requestBody).length !== 5
  ) {
    return Promise.reject({ statusCode: 400, msg: "Bad Request" });
  }

  queryStr += `)
  VALUES
  %L
  RETURNING *, 0 AS comment_count;
  ;`;

  queryStr = format(queryStr, [queryValues]);
  return db.query(queryStr).then(({ rows: [row] }) => {
    return row;
  });
};

exports.addCategory = (requestBody) => {
  const { slug, description } = requestBody;

  if (Object.keys(requestBody).length !== 2) {
    return Promise.reject({ statusCode: 400, msg: "Bad Request" });
  }
  const queryStr = `
  INSERT INTO categories
    (slug, description)
    VALUES
    ($1, $2)
    RETURNING *
    ;`;

  const queryValues = [slug, description];

  if (queryValues.includes(undefined)) {
    return Promise.reject({ statusCode: 400, msg: "Bad Request" });
  }

  return db.query(queryStr, queryValues).then(({ rows: [row] }) => {
    return row;
  });
};

exports.removeReview = (review_id) => {
  const queryStr = `
    DELETE FROM reviews
    WHERE review_id = $1
    RETURNING *
  ;`;

  return db.query(queryStr, [review_id]).then((response) => {
    return response;
  });
};
