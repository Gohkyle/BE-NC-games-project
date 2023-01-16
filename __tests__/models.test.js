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

describe("GET /api/notARoute", () => {
  test("resolves with a 404: Not found for route that does not exist", () => {
    return request(app).get("/api/notaroute").expect(404);
  });
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
  test("resolves with an array with the correct keys", () => {
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
});

describe("GET /api/reviews", () => {
  test("resolves with an reviews array", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toBeInstanceOf(Array);
        expect(reviews).toHaveLength(13);
      });
  });
  test("resolves with an array with the correct keys", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body: { reviews } }) => {
        reviews.forEach((review) => {
          expect(review).toHaveProperty("owner");
          expect(review).toHaveProperty("title");
          expect(review).toHaveProperty("category");
          expect(review).toHaveProperty("review_img_url");
          expect(review).toHaveProperty("created_at");
          expect(review).toHaveProperty("votes");
          expect(review).toHaveProperty("designer");
          expect(review).toHaveProperty("comment_count");
        });
      });
  });
  test("resolves with data sorted by date in descending order", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("resolves with a comment_count key with the total count of all the comments for that review_id", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body: { reviews } }) => {
        const shouldBe3 = reviews.find((review) => {
          return review.review_id === 2;
        });

        expect(shouldBe3.comment_count).toBe("3");

        const shouldBe0 = reviews.find((review) => {
          return review.review_id === 1;
        });

        expect(shouldBe0.comment_count).toBe("0");
      });
  });
});
describe("GET /api/reviews/:review_id", () => {
  test("resolves with a review object with all the correct keys and values", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review).toHaveProperty("review_id", 2);
        expect(review).toHaveProperty("title", "Jenga");
        expect(review).toHaveProperty(
          "review_body",
          "Fiddly fun for all the family"
        );
        expect(review).toHaveProperty("designer", "Leslie Scott");
        expect(review).toHaveProperty(
          "review_img_url",
          "https://images.pexels.com/photos/4473494/pexels-photo-4473494.jpeg?w=700&h=700"
        );
        expect(review).toHaveProperty("votes", 5);
        expect(review).toHaveProperty("category", "dexterity");
        expect(review).toHaveProperty("owner", "philippaclaire9");
        expect(review).toHaveProperty("created_at", "2021-01-18T10:01:41.251Z");
      });
  });
  describe("ErrorHandlers:", () => {
    test("sends back 404 error for IDs that do not exist", () => {
      return request(app)
        .get("/api/reviews/99999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("ID Does Not Exist");
        });
    });
    test("sends back a 400 request for invalid ID data types", () => {
      return request(app)
        .get("/api/reviews/nine")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
  });
});
