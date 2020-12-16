// Require/Import
const express = require("express");
const cors = require("cors");
const listEndpoints = require("express-list-endpoints");
const {
  notFoundErrorHandler,
  unauthorizedErrorHandler,
  forbiddenErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
} = require("./errorHandling");

//Routes
const attendeesRouter = require("./services/attendees");

// Instances
const server = express();

// PORT
const port = process.env.PORT || 3003;

// USE
server.use(cors());
server.use(express.json());
server.use("/attendees", attendeesRouter);

//Errors
server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(forbiddenErrorHandler);
server.use(unauthorizedErrorHandler);
server.use(catchAllErrorHandler);

console.log(listEndpoints(server));

server.listen(port, () => {
  if (process.env.NODE_ENV === "production") {
    console.log("Running on cloud on port", port);
  } else {
    console.log("Running locally on port", port);
  }
});
