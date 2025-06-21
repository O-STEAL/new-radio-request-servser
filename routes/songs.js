const express = require("express");
const songController = require("../controllers/songController");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();

// 신청곡 등록
router.post("/submit", songController.submitSong);
// 오늘의 신청곡
router.get("/today", songController.getTodaySongs);
// 전체 신청곡
router.get("/all", songController.getAllSongs);
// 내 신청곡 (토큰 필요)
router.get("/my/:username", authMiddleware, songController.getMySongs);

module.exports = router;
