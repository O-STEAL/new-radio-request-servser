const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

// 회원가입
router.post("/register", authController.register);
// 로그인
router.post("/login", authController.login);
// username 중복 체크
router.post("/check-id", authController.checkId);

module.exports = router;
