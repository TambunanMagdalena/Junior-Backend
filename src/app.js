const express = require("express");
require("dotenv").config();

const bookRoutes = require("./routes/bookRoutes");
const memberRoutes = require("./routes/memberRoutes");
const borrowingRoutes = require("./routes/borrowingRoutes");

const app = express();

app.use(express.json());

app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/borrowings", borrowingRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Library Management API is running!",
    endpoints: {
      books: "/api/books",
      members: "/api/members",
      borrowings: "/api/borrowings",
    },
  });
});

app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
