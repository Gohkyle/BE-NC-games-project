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
  test("404: Not found for route that does not exist", () => {
    return request(app)
      .get("/api/notaroute")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Route Does Not Exist");
      });
  });
});

describe("GET /api/categories", () => {
  test("200: resolves with a categories array", () => {
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
});

describe("GET /api/reviews", () => {
  test("200: resolves with an reviews array", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toBeInstanceOf(Array);
        expect(reviews).toHaveLength(13);
      });
  });
  test("200: resolves with an array with the correct keys", () => {
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
  test("200: resolves with data sorted by date in descending order", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: resolves with a comment_count key with the total count of all the comments for that review_id", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body: { reviews } }) => {
        const shouldBe3 = reviews.find((review) => {
          return review.review_id === 2;
        });

        expect(shouldBe3.comment_count).toBe(3);

        const shouldBe0 = reviews.find((review) => {
          return review.review_id === 1;
        });

        expect(shouldBe0.comment_count).toBe(0);
      });
  });
  describe("?query", () => {
    describe("category", () => {
      test("200: features a category query, that selects the reviews by the specified category", () => {
        return request(app)
          .get("/api/reviews?category=social deduction")
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toHaveLength(11);
            reviews.forEach((review) => {
              expect(review).toHaveProperty("category", "social deduction");
            });
          });
      });
      describe("Error Handling:", () => {
        test("404: category doesn't exist", () => {
          return request(app)
            .get("/api/reviews?category=card game")
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("Category Not Found");
            });
        });
        test("200: category exists but has no reviews", () => {
          return request(app)
            .get("/api/reviews?category=children's games")
            .expect(200)
            .then(({ body: { reviews } }) => {
              expect(reviews).toEqual([]);
            });
        });
        // autopasses as the code doesn't allow for incorrect categories, thus never needs promise reject at row count 0
      });
    });
    describe("sort_by", () => {
      test("200: reviews can be sorted by different columns via query", () => {
        return request(app)
          .get("/api/reviews?sort_by=title")
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toBeSortedBy("title", { descending: true });
          });
      });
      describe("Error Handling:", () => {
        test("400: only accepts set column names", () => {
          return request(app)
            .get("/api/reviews?sort_by=date")
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("Bad Request: Column does not exist!");
            });
        });
      });
    });
    describe("order_by", () => {
      test("200: reviews are able to be sorted in ascending/descending", () => {
        return request(app)
          .get("/api/reviews?order_by=asc")
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toBeSortedBy("created_at");
          });
      });
      describe("Error Handling:", () => {
        test("400: only takes ASC or DESC", () => {
          return request(app)
            .get("/api/reviews?order_by=true")
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("Bad Request: ASC or DESC ONLY");
            });
        });
      });
    });
    describe("multiple queries", () => {
      test("able to take multiple queries", () => {
        return request(app)
          .get(
            "/api/reviews?category=social deduction&order_by=asc&sort_by=title"
          )
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toBeSortedBy("title");
            expect(reviews).toHaveLength(11);
            reviews.forEach((review) => {
              expect(review).toHaveProperty("category", "social deduction");
            });
          });
      });
    });
  });
});

describe("GET /api/reviews/:review_id", () => {
  test("200: resolves with a review object with all the correct keys and values, including comment_count", () => {
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
  test("200: also resolves with a comment_count key, with correct value", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review).toHaveProperty("comment_count", 3);
      });
  });
  describe("ErrorHandlers:", () => {
    test("404: Not Found for IDs that do not exist", () => {
      return request(app)
        .get("/api/reviews/99999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("ID Not Found");
        });
    });
    test("400: Bad request for invalid ID data types", () => {
      return request(app)
        .get("/api/reviews/nine")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
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
  test("200: reviews with no comments should respond with an empty array", () => {
    return request(app)
      .get("/api/reviews/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });
  describe("Error Handlers", () => {
    test("400: Bad Request, for invalid review _id", () => {
      return request(app)
        .get("/api/reviews/99999/comments")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("ID Not Found");
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

describe("POST /api/reviews/:review_id/comments", () => {
  test("201: post request responds with the comment", () => {
    const commentBody = { username: "philippaclaire9", body: "Hello" };

    return request(app)
      .post("/api/reviews/1/comments")
      .send(commentBody)
      .expect(201)
      .then(({ body: { postedComment } }) => {
        expect(postedComment).toBe("Hello");
      });
  });
  test("200: returns the expect comment object", () => {
    const commentBody = { username: "philippaclaire9", body: "Hello" };

    return request(app)
      .post("/api/reviews/1/comments")
      .send(commentBody)
      .then(() => {
        return request(app)
          .get("/api/reviews/1/comments")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toHaveLength(1);
            expect(comments[0]).toHaveProperty("author", "philippaclaire9");
            expect(comments[0]).toHaveProperty("body", "Hello");
            expect(comments[0]).toHaveProperty("comment_id", 7);
            expect(comments[0]).toHaveProperty("review_id", 1);
            expect(comments[0]).toHaveProperty("created_at");
          });
      });
  });
  describe("Error Handlers:", () => {
    test("400: malformed request body (23502)", () => {
      const commentBody = { username: "philippaclaire9" };

      return request(app)
        .post("/api/reviews/1/comments")
        .send(commentBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
    //Test passes via non 23502 handling
    test("404: username not recognised (23503)", () => {
      commentBody = { username: "EddTheDuck", body: "Quack" };

      return request(app)
        .post("/api/reviews/1/comments")
        .send(commentBody)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Username Not Found");
        });
    });
    test("404: review_id does not exist", () => {
      const commentBody = { username: "philippaclaire9", body: "Hello" };
      return request(app)
        .post("/api/reviews/99999/comments")
        .send(commentBody)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("ID Not Found");
        });
    });
    test("400: invalid data type for review_id", () => {
      const commentBody = { username: "philippaclaire9", body: "Hello" };
      return request(app)
        .post("/api/reviews/review/comments")
        .send(commentBody)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
    test("400: only accepts username and body for the request body", () => {
      const commentBody = {
        username: "philippaclaire9",
        body: "Hello",
        vote: 16,
      };
      return request(app)
        .post("/api/reviews/1/comments")
        .send(commentBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
  });
});

describe("PATCH /api/reviews/:review_id", () => {
  test("200: returns the updated review", () => {
    return request(app)
      .patch("/api/reviews/2")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body: { updatedReview } }) => {
        expect(updatedReview).toHaveProperty("review_id", 2);
        expect(updatedReview).toHaveProperty("title", "Jenga");
        expect(updatedReview).toHaveProperty("designer", "Leslie Scott");
        expect(updatedReview).toHaveProperty("owner", "philippaclaire9");
        expect(updatedReview).toHaveProperty(
          "review_img_url",
          "https://images.pexels.com/photos/4473494/pexels-photo-4473494.jpeg?w=700&h=700"
        );
        expect(updatedReview).toHaveProperty(
          "review_body",
          "Fiddly fun for all the family"
        );
        expect(updatedReview).toHaveProperty(
          "created_at",
          "2021-01-18T10:01:41.251Z"
        );
        expect(updatedReview).toHaveProperty("votes", 6);
      });
  });
  test("200: database is updated", () => {
    return request(app)
      .patch("/api/reviews/2")
      .send({ inc_votes: -5 })
      .expect(200)
      .then(() => {
        return request(app)
          .get("/api/reviews/2")
          .expect(200)
          .then(({ body: { review } }) => {
            expect(review).toHaveProperty("review_id", 2);
            expect(review).toHaveProperty("votes", 0);
          });
      });
  });
  describe("Error Handlers", () => {
    test("400: incorrect data type, vote increase is not a number", () => {
      return request(app)
        .patch("/api/reviews/2")
        .send({ inc_votes: "five" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
    test("400: malformed body", () => {
      return request(app)
        .patch("/api/reviews/2")
        .send({ inc_votes: "null" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
    //test passes through error handling from line 396
    test("400: only have inc_votes", () => {
      return request(app)
        .patch("/api/reviews/2")
        .send({ inc_votes: 1, owner: "it's me now" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
    test("404: review not found", () => {
      return request(app)
        .patch("/api/reviews/9999")
        .send({ inc_votes: 2 })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("ID Not Found");
        });
    });
    test("400: review not valid", () => {
      return request(app)
        .patch("/api/reviews/five")
        .send({ inc_votes: 2 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
  });
});

describe("GET /api/users", () => {
  test("200: resolves with a users array", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toBeInstanceOf(Array);
        expect(users).toHaveLength(4);
      });
  });
  test("200: resolves with the correct keys", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        users.forEach((user) => {
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("name");
          expect(user).toHaveProperty("avatar_url");
        });
      });
  });
});

//see Line 125, for comment count
