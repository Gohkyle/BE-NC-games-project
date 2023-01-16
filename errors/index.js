exports.handleRouteErrors = (request, response, next) => {
  response.status(404).send("Route Does Not Exist");
  next();
};

exports.handleServerErrors = (error, request, response, next) => {
  console.log(error);
  response.status(500).send("Internal Server Error");
};
