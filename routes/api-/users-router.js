const usersRouter = require("express").Router();

const {
  getUsers,
  getUsersByUserId,
} = require("../../controllers/app-controllers");

usersRouter.get("/", getUsers);

usersRouter.get("/:username", getUsersByUserId);

module.exports = usersRouter;
