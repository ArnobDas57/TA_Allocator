const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");
const port = process.env.PORT || 5000;
const app = express();
let cors = require("cors");
mongoose.connect(
  db,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  () => console.log("Connected to DB")
);

mongoose.set("useFindAndModify", false);

app.use(express.json());

//Specify routes, all functionalities should be within the respective file within the routes folder
app.use("/users", require("./routes/users"));
app.use("/courses", require("./routes/courses"));
app.use("/applicants", require("./routes/applicants"));
app.use("/instructors", require("./routes/instructors"));
app.use("/match", require("./routes/matching"));
app.use("/auth", require("./routes/auth"));
app.use("/file", require("./routes/file"));
app.use("/allocation", require("./routes/allocation"));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
