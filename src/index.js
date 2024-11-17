const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");

// let server=app;

// mongoose
//   .connect(config.mongoose.url)
//   .then(() => console.log("Connected to DB at", config.mongoose.url))
//   .catch((error) => console.log("Failed to connect to DB\n", error));

// server.listen(config.port, () => {
//   console.log("Server Listening at", config.port);
// });
// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port

let server = () => {
  app.listen(config.port, async() => {
    console.log(`Server Listening at ${config.port}`);
    await mongoose
      .connect(config.mongoose.url, config.mongoose.options)
      .then(() => console.log("Connected to DB at", config.mongoose.url))
      .catch((error) => console.log("Failed to connect to DB\n", error));
  })
}
server();
