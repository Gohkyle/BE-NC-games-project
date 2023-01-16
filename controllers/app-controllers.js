const { fetchCategories } = require("../models/app-models");

exports.getCategories = (request, response, next) => {
  fetchCategories().then((categories) => {
    response.status(200).send({ categories });
  });
};
