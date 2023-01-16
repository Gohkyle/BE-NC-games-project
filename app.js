const express = require("express");
const app = express();

const { getCategories } = require("./controllers/app-controllers");

app.get("/api/categories", getCategories);

app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send("Internal Server Error");
});
module.exports = app;
