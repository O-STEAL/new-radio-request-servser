const express = require("express");
const songController = require("../controllers/songController");
const router = express.Router();

// 신청곡 등록
router.post("/submit", songController.submitSong);
// 오늘의 신청곡
router.get("/today", songController.getTodaySongs);
// 전체 신청곡
router.get("/all", songController.getAllSongs);
// 내 신청곡
router.get("/my/:username", songController.getMySongs);

module.exports = router;
