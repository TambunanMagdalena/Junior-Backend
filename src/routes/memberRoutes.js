const express = require("express");
const MemberController = require("../controllers/memberController");

const router = express.Router();

router.post("/", MemberController.createMember);
router.get("/:id", MemberController.getMemberById);

module.exports = router;
