exports.handleRouteErrors = (error, request, response, next) => {
  response.status(404).send("Route Does Not Exist");
  next(error);
};

exports.handleServerErrors = (error, request, response, next) => {
  console.log(error);
  response.status(500).send("Internal Server Error");
};
