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

describe.only("POST /api/categories", () => {
  test("201: responds with an object with all the correct keys", () => {
    const requestBody = {
      slug: "Engine Building",
      description: "Players have a set of personal resources used to progress",
    };
    return request(app)
      .post("/api/categories")
      .send(requestBody)
      .expect(201)
      .then(({ body: { postedCategory } }) => {
        expect(postedCategory).toHaveProperty("slug", "Engine Building");
        expect(postedCategory).toHaveProperty(
          "description",
          "Players have a set of personal resources used to progress"
        );
      });
  });
  test("200: database has a new entry", () => {
    const requestBody = {
      slug: "Engine Building",
      description: "Players have a set of personal resources used to progress",
    };
    return request(app)
      .post("/api/categories")
      .send(requestBody)
      .expect(201)
      .then(() => {
        return request(app)
          .get("/api/categories")
          .expect(200)
          .then(({ body: { categories } }) => {
            expect(categories).toHaveLength(5);
          });
      });
  });
  describe("Error Handling:", () => {
    test("400: incorrect number of keys", () => {
      const badBodyRequest = {
        slug: "Roll and Move",
      };
      return request(app)
        .post("/api/categories")
        .send(badBodyRequest)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
    test("400: incorrect keys, correct number of keys", () => {
      const badRequestBody = {
        name: "Qatan",
        players: "2",
      };
      return request(app)
        .post("/api/categories")
        .send(badRequestBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
    test("400: only accepts correct keys", () => {
      const badRequestBody = {
        slug: "Co op",
        players: "2",
      };
      return request(app)
        .post("/api/categories")
        .send(badRequestBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
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
        expect(reviews).toHaveLength(10);
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
            expect(reviews).toHaveLength(10);
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
        test("200: no 404 for categories that are newly added", () => {
          const queryStr = `
            INSERT INTO categories
            (slug, description)
            VALUES 
            ('mind', 'think about it')
            RETURNING *
          ;`;
          return db.query(queryStr).then(() => {
            return request(app)
              .get("/api/reviews?category=mind")
              .expect(200)
              .then(({ body: { reviews } }) => {
                expect(reviews).toEqual([]);
              });
          });
        });
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
    describe("limit", () => {
      test("200: accepts a limit query", () => {
        return request(app)
          .get("/api/reviews?limit=2")
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toHaveLength(2);
          });
      });
      test("200: it defaults to limit of 10", () => {
        return request(app)
          .get("/api/reviews")
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toHaveLength(10);
          });
      });
      describe("Error Handling:", () => {
        test("400: limit is not a number", () => {
          return request(app)
            .get("/api/reviews?limit=ten")
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("Bad Request");
            });
        });
      });
    });
    describe("p", () => {
      test("200: accepts a page query", () => {
        return request(app)
          .get("/api/reviews?p=2")
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toHaveLength(3);
          });
      });
      test("200: page 1 shows by default", () => {
        return request(app)
          .get("/api/reviews")
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toHaveLength(10);
          });
      });
      describe("Error Handling:", () => {
        // test("404: page not found", () => {
        //   return request(app)
        //     .get("/api/reviews?p=10")
        //     .expect(404)
        //     .then(({ body: { msg } }) => {
        //       expect(msg).toBe("No Content Found");
        //     });
        // });
        // test("404: page not found", () => {
        //   return request(app)
        //     .get("/api/reviews?p=-1")
        //     .expect(404)
        //     .then(({ body: { msg } }) => {
        //       expect(msg).toBe("No Content Found");
        //     });
        // });
        test("400: page not valid", () => {
          return request(app)
            .get("/api/reviews?p=five")
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("Bad Request");
            });
        });
      });
    });
    describe("other:", () => {
      test("200: able to take multiple queries", () => {
        return request(app)
          .get(
            "/api/reviews?category=social deduction&order_by=asc&sort_by=title"
          )
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toBeSortedBy("title");
            expect(reviews).toHaveLength(10);
            reviews.forEach((review) => {
              expect(review).toHaveProperty("category", "social deduction");
            });
          });
      });
      test("200: has a total_count property, displaying the number of reviews ignoring the limit", () => {
        return request(app)
          .get("/api/reviews")
          .expect(200)
          .then(({ body: { reviews } }) => {
            reviews.forEach((review) => {
              expect(review).toHaveProperty("total_count", 13);
            });
          });
      });
      test("200: has a total_count property, displaying the number of reviews with any filter ignoring the limit", () => {
        return request(app)
          .get("/api/reviews?category=social deduction")
          .expect(200)
          .then(({ body: { reviews } }) => {
            reviews.forEach((review) => {
              expect(review).toHaveProperty("total_count", 11);
            });
          });
      });
    });
  });
});

describe("POST /api/reviews", () => {
  test("201: responds with an object with all the correct keys", () => {
    const reviewRequestBody = {
      owner: "philippaclaire9",
      title: "Catan",
      review_body:
        "When I first opened it I was really put off by the amount of instructions- don’t be…once you start playing it is easy to understand and great fun for kids and parents!",
      designer: "Klaus Teuber",
      category: "children's games",
      review_img_url:
        "https://store-images.s-microsoft.com/image/apps.15567.14321522258952035.0bdbf2e3-3d9e-4997-92d8-7874c1432866.b0f7e376-74ca-4321-81f0-0c90a485beb1",
    };
    return request(app)
      .post("/api/reviews")
      .send(reviewRequestBody)
      .expect(201)
      .then(({ body: { review } }) => {
        expect(review).toHaveProperty("owner", "philippaclaire9");
        expect(review).toHaveProperty("title", "Catan");
        expect(review).toHaveProperty(
          "review_body",
          "When I first opened it I was really put off by the amount of instructions- don’t be…once you start playing it is easy to understand and great fun for kids and parents!"
        );
        expect(review).toHaveProperty("designer", "Klaus Teuber");
        expect(review).toHaveProperty("category", "children's games");
        expect(review).toHaveProperty(
          "review_img_url",
          "https://store-images.s-microsoft.com/image/apps.15567.14321522258952035.0bdbf2e3-3d9e-4997-92d8-7874c1432866.b0f7e376-74ca-4321-81f0-0c90a485beb1"
        );
        expect(review).toHaveProperty("review_id", 14);
        expect(review).toHaveProperty("votes", 0);
        expect(review).toHaveProperty("created_at");
      });
  });
  test("201: also responds with a comment_count key", () => {
    const reviewRequestBody = {
      owner: "philippaclaire9",
      title: "Catan",
      review_body:
        "When I first opened it I was really put off by the amount of instructions- don’t be…once you start playing it is easy to understand and great fun for kids and parents!",
      designer: "Klaus Teuber",
      category: "children's games",
      review_img_url:
        "https://store-images.s-microsoft.com/image/apps.15567.14321522258952035.0bdbf2e3-3d9e-4997-92d8-7874c1432866.b0f7e376-74ca-4321-81f0-0c90a485beb1",
    };
    return request(app)
      .post("/api/reviews")
      .send(reviewRequestBody)
      .expect(201)
      .then(({ body: { review } }) => {
        expect(review).toHaveProperty("comment_count", 0);
      });
  });
  test("200: database has a new entry", () => {
    const reviewRequestBody = {
      owner: "philippaclaire9",
      title: "Catan",
      review_body:
        "When I first opened it I was really put off by the amount of instructions- don’t be…once you start playing it is easy to understand and great fun for kids and parents!",
      designer: "Klaus Teuber",
      category: "children's games",
      review_img_url:
        "https://store-images.s-microsoft.com/image/apps.15567.14321522258952035.0bdbf2e3-3d9e-4997-92d8-7874c1432866.b0f7e376-74ca-4321-81f0-0c90a485beb1",
    };
    return request(app)
      .post("/api/reviews")
      .send(reviewRequestBody)
      .expect(201)
      .then(() => {
        return request(app)
          .get("/api/reviews")
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toHaveLength(10);
          });
      });
  });
  test("201: review_img_url is given default url if not stated", () => {
    const reviewRequestBody = {
      owner: "philippaclaire9",
      title: "Catan",
      review_body:
        "When I first opened it I was really put off by the amount of instructions- don’t be…once you start playing it is easy to understand and great fun for kids and parents!",
      designer: "Klaus Teuber",
      category: "children's games",
    };
    return request(app)
      .post("/api/reviews")
      .send(reviewRequestBody)
      .expect(201)
      .then(({ body: { review } }) => {
        expect(review).toHaveProperty(
          "review_img_url",
          "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=700&h=700"
        );
      });
  });

  describe("Error Handling:", () => {
    test("404: not a valid owner", () => {
      const reviewRequestBody = {
        owner: "EddTheDuck",
        title: "Catan",
        review_body:
          "When I first opened it I was really put off by the amount of instructions- don’t be…once you start playing it is easy to understand and great fun for kids and parents!",
        designer: "Klaus Teuber",
        category: "children's games",
      };
      return request(app)
        .post("/api/reviews")
        .send(reviewRequestBody)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Username Not Found");
        });
    });
    test("400: malformed body", () => {
      const reviewRequestBody = {
        owner: "philippaClaire9",
        category: "children's games",
      };
      return request(app)
        .post("/api/reviews")
        .send(reviewRequestBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
    test("400: only accepts certain keys", () => {
      const reviewRequestBody = {
        owner: "philippaclaire9",
        title: 5,
        review_body:
          "When I first opened it I was really put off by the amount of instructions- don’t be…once you start playing it is easy to understand and great fun for kids and parents!",
        comment: "I like this game",
        category: "children's games",
      };
      return request(app)
        .post("/api/reviews")
        .send(reviewRequestBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
    test("400: does not accept any excess keys in the body (without review_img_url)", () => {
      const reviewRequestBody = {
        owner: "philippaclaire9",
        title: 5,
        review_body:
          "When I first opened it I was really put off by the amount of instructions- don’t be…once you start playing it is easy to understand and great fun for kids and parents!",
        designer: "Klaus Teuber",
        comment: "I like this game",
        category: "children's games",
      };
      return request(app)
        .post("/api/reviews")
        .send(reviewRequestBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
    test("400: does not accept any excess keys in the body, (with review_img_url)", () => {
      const reviewRequestBody = {
        owner: "philippaclaire9",
        title: 5,
        review_body:
          "When I first opened it I was really put off by the amount of instructions- don’t be…once you start playing it is easy to understand and great fun for kids and parents!",
        designer: "Klaus Teuber",
        comment: "I like this game",
        category: "children's games",
        review_img_url: "http://",
      };
      return request(app)
        .post("/api/reviews")
        .send(reviewRequestBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
    test("400: all NOT NULL columns are fulfilled", () => {
      const reviewRequestBody = {
        owner: "philippaclaire9",
        title: 5,
        designer: "Klaus Teuber",
        comment: "I like this game",
        category: "children's games",
        review_img_url: "http://",
      };
      return request(app)
        .post("/api/reviews")
        .send(reviewRequestBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
  });
});

describe("GET /api/reviews/:review_id", () => {
  test("200: resolves with a review object with all the correct keys and values", () => {
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

// describe("DELETE /api/review/:review_id", () => {
//   test("204: no content");
//   test("404: review is removed from the database, review not found");
//   describe("Error Handling:", () => {
//     test("400: review_id is not valid", () => {});
//     test("404: review_id does not exist", () => {});
//   });
// });

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
  // describe("pagination queries:", () => {
  //   describe("limit", () => {
  //     test("200: accepts a limit query", () => {});
  //     test("200: defaults to limit=10", () => {});
  //     describe("Error Handling:", () => {
  //       test("400: limit is not a number", () => {});
  //     });
  //   });
  //   describe("p", () => {
  //     test("200: accepts a p query", () => {});
  //     test("200: defaults to page 1", () => {});
  //     describe("Error Handling:", () => {
  //       test("400: p is not valid", () => {});
  //       test("404: page not found", () => {});
  //     });
  //   });
  // });
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
  test("200: database has a new entry", () => {
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

describe("PATCH /api/comments/:comment_id", () => {
  test("200: returns the updated comment", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body: { updatedComment } }) => {
        console.log(updatedComment);
        expect(updatedComment).toHaveProperty("comment_id", 2);
        expect(updatedComment).toHaveProperty(
          "body",
          "My dog loved this game too!"
        );
        expect(updatedComment).toHaveProperty("votes", 14);
        expect(updatedComment).toHaveProperty("author", "mallionaire");
        expect(updatedComment).toHaveProperty("review_id", 3);
        expect(updatedComment).toHaveProperty(
          "created_at",
          "2021-01-18T10:09:05.410Z"
        );
      });
  });
  test("200: the database is updated", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: -1 })
      .expect(200)
      .then(() => {
        return request(app)
          .get("/api/reviews/3/comments")
          .expect(200)
          .then(({ body: { comments } }) => {
            const commentId2 = comments.find(({ comment_id }) => {
              return comment_id === 2;
            });
            expect(commentId2).toHaveProperty("comment_id", 2);
            expect(commentId2).toHaveProperty("review_id", 3);
            expect(commentId2).toHaveProperty("votes", 12);
          });
      });
  });
  describe("Error Handling:", () => {
    test("404: comment_id does not exist", () => {
      return request(app)
        .patch("/api/comments/9999")
        .send({ inc_votes: 1 })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Comment Not Found");
        });
    });
    test("400: comment_id is not valid", () => {
      return request(app)
        .patch("/api/comments/sunshine")
        .send({ inc_votes: 1 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
    test("400: only takes inc_votes", () => {
      return request(app)
        .patch("/api/comments/3")
        .send({ body: "new content" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request Body");
        });
    });
    test("400: body only takes one key", () => {
      return request(app)
        .patch("/api/comments/3")
        .send({ body: "new content", inc_votes: 1 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request Body");
        });
    });
    test("400:malformed body", () => {
      return request(app)
        .patch("/api/comments/3")
        .send({})
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request Body");
        });
    });
    test("400: votes is not a number", () => {
      return request(app)
        .patch("/api/comments/3")
        .send({ inc_votes: "five" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: responds with undefined", () => {
    return request(app)
      .delete("/api/comments/4")
      .expect(204)
      .then(({ body: { deletedComment } }) => {
        expect(deletedComment).toBeUndefined();
      });
  });
  test("404: comment is removed from database, comment not found", () => {
    return request(app)
      .delete("/api/comments/4")
      .expect(204)
      .then(() => {
        return request(app)
          .get("/api/reviews/2/comments")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toHaveLength(2);

            comments.forEach(({ comment_id }) => {
              console.log(comment_id);
              expect(comment_id).not.toBe(4);
            });
          });
      });
  });
  describe("Error Handling:", () => {
    test("400: comment_id is not valid", () => {
      return request(app)
        .delete("/api/comments/banana")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request");
        });
    });
    test("404: comment_id does not exist", () => {
      return request(app)
        .delete("/api/comments/999")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request: Comment does not exist!");
        });
    });
  });
});

describe("GET /api", () => {
  test("200: resolves with a endpoints.json", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toHaveProperty("GET /api");
        expect(endpoints).toHaveProperty("GET /api/categories");
        expect(endpoints).toHaveProperty("GET /api/reviews");
        expect(endpoints).toHaveProperty("GET /api/reviews/:review_id");
        expect(endpoints).toHaveProperty(
          "GET /api/reviews/:review_id/comments"
        );
        expect(endpoints).toHaveProperty(
          "POST /api/reviews/:review_id/comments"
        );
        expect(endpoints).toHaveProperty("PATCH /api/reviews/:review_id");
        expect(endpoints).toHaveProperty("DELETE /api/comments/:comment_id");
      });
  });
});

describe("GET /api/users/:username", () => {
  test("200: resolves with a user object with all the correct keys and values", () => {
    return request(app)
      .get("/api/users/philippaclaire9")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toHaveProperty("username", "philippaclaire9");
        expect(user).toHaveProperty("name", "philippa");
        expect(user).toHaveProperty(
          "avatar_url",
          "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4"
        );
      });
  });
  describe("Error Handling:", () => {
    test("404: username not found", () => {
      return request(app)
        .get("/api/users/EddTheDuck")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Username Not Found");
        });
    });
  });
});
