const commentsRouter = require("express").Router();

const { deleteComment } = require("../../controllers/app-controllers");

commentsRouter.delete("/:comment_id", deleteComment);

module.exports = commentsRouter;
