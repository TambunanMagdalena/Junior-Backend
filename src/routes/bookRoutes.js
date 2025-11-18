const express = require("express");
const BookController = require("../controllers/bookController");

const router = express.Router();

router.get("/", BookController.getAllBooks);
router.get("/:id", BookController.getBookById);
router.post("/", BookController.createBook);

module.exports = router;
