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
        console.log(categories);
        expect(categories).toBeInstanceOf(Array);
        expect(categories).toHaveLength(4);
      });
  });
});
