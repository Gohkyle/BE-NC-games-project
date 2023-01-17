const request = require("supertest");
const app = require("../app");
const testData = require("../db/data/test-data/");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  db.end();
});

describe("GET /api/categories", () => {
  test("statuscode: 200", () => {
    return request(app).get("/api/categories").expect(200);
  });
  test("resolves with an categories array", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then(({ body: { categories } }) => {
        expect(categories).toBeInstanceOf(Array);
        expect(categories).toHaveLength(4);
      });
  });
  test("200: resolves with an array with the correct keys", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then(({ body: { categories } }) => {
        categories.forEach((category) => {
          expect(category).toHaveProperty("slug");
          expect(category).toHaveProperty("description");
        });
      });
  });
  test("404: Not found for route that does not exist", () => {
    return request(app)
      .get("/api/notaroute")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Route Does Not Exist");
      });
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  test("200: resolves with an array of comments for the given review_id", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeInstanceOf(Array);
        // split these up?
        expect(comments).toHaveLength(3);

        comments.forEach((comment) => {
          expect(comment.review_id).toBe(2);
        });
      });
  });
  test("200: resolves with an comment objects with the correct keys", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("created_at");
          expect(comment).toHaveProperty("author");
          expect(comment).toHaveProperty("body");
          expect(comment).toHaveProperty("review_id");
        });
      });
  });
  test("200: comments are ordered in most recent first, descending?", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  //   test.only("200: reviews with no comments should respond with an empty array", () => {
  //     return request(app)
  //       .get("/api/reviews/1/comments")
  //       .expect(200)
  //       .then(({ body: { comments } }) => {
  //         expect(comments).toEqual([]);
  //       });
  //   });
  describe("Error Handlers", () => {
    test("400: Bad Request, for invalid review _id", () => {
      return request(app)
        .get("/api/reviews/99999/comments")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("ID Does Not Exist");
        });
    });
    test("404: Not Found, for review_id does not exist", () => {
      return request(app)
        .get("/api/reviews/two/comments")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
  });
});
