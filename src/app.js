const express = require("express");
require("dotenv").config();

const bookRoutes = require("./routes/bookRoutes");
const memberRoutes = require("./routes/memberRoutes");
const borrowRoutes = require("./routes/borrowRoutes");

const app = express();

app.use(express.json());

app.use("/books", bookRoutes);
app.use("/members", memberRoutes);
app.use("/borrows", borrowRoutes);

app.get("/", (req, res) => {
  console.error(error.stack);
  res.status(500).json("Something wrong!");
});

app.use("*", (req, res) => {
  res.status(404).json(" Route Not Found");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
