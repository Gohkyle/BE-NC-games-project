exports.handleRouteErrors = (request, response, next) => {
  response.status(404).send({ msg: "Route Does Not Exist" });
};

exports.handleCustomErrors = (error, request, response, next) => {
  if (error.statusCode && error.msg) {
    response.status(error.statusCode).send({ msg: error.msg });
  } else next(error);
};

exports.handlePsqlErrors = (error, request, response, next) => {
  if (error.code === "22P02") {
    response.status(400).send({ msg: "Bad Request" });
  }
  if (error.code === "23503") {
    //Author is no present in users
    response.status(404).send({ msg: "Username Not Found" });
  }
  if (error.code === "23502") {
    //empty rows, that cannot be null
    response.status(400).send({ msg: "Bad Request" });
  } else next(error);
};

exports.handleServerErrors = (error, request, response, next) => {
  console.log(error);
  response.status(500).send("Internal Server Error");
};
