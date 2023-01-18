exports.handleRouteErrors = (request, response, next) => {
  response.status(404).send({ msg: "Route Does Not Exist" });
};

exports.handleCustomErrors = (error, request, response, next) => {
  if (error.statusCode && error.msg) {
    response.status(error.statusCode).send({ msg: error.msg });
  }
  next(error);
};

exports.handlePsqlErrors = (error, request, response, next) => {
  if (error.code === "22P02") {
    response.status(400).send({ msg: "Bad Request" });
  }
  if (error.code === "23502") {
    response.status(400).send({ msg: "Bad Request, Not Null Constraint" });
  }
  next(error);
};

exports.handleServerErrors = (error, request, response, next) => {
  console.log(error);
  response.status(500).send("Internal Server Error");
};
