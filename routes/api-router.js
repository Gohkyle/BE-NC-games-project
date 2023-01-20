const apiRouter = require("express").Router();

const { getApiEndpoints } = require("../controllers/app-controllers");

const {
  categoriesRouter,
  reviewsRouter,
  usersRouter,
  commentsRouter,
} = require("./api-/");

apiRouter.get("/", getApiEndpoints);

apiRouter.use("/categories", categoriesRouter);

apiRouter.use("/reviews", reviewsRouter);

apiRouter.use("/users", usersRouter);

apiRouter.use("/comments", commentsRouter);

module.exports = { apiRouter };
