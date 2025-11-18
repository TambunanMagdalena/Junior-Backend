const express = require("express");
const BorrowingController = require("../controllers/borrowingController");

const router = express.Router();

router.post("/", BorrowingController.borrowBook);
router.put("/:id/return", BorrowingController.returnBook);
router.get("/members/:id/borrowings", BorrowingController.getMemberBorrowings);

module.exports = router;
