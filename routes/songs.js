// 신청곡 관련 API 라우터
const express = require("express");
const { Song, User } = require("../models");
const router = express.Router();

// 신청곡 등록 API
// POST /songs/submit
router.post("/submit", async (req, res) => {
  // 프론트에서 보낸 값들 구조분해
  const { userId, isAnonymous, hasStory, story, link } = req.body;
  try {
    // 필수값 체크
    if (!userId) return res.status(400).json({ message: "필수값 누락" });
    // 유저가 존재하는지 확인
    const user = await User.findOne({ where: { userId } });
    if (!user) return res.status(400).json({ message: "유저 없음" });
    // 오늘 날짜
    const today = new Date().toISOString().slice(0, 10);
    // 신청곡 등록
    await Song.create({
      date: today,
      isAnonymous: !!isAnonymous,
      hasStory: !!hasStory,
      story: hasStory ? story : "",
      link,
      UserId: user.id,
    });
    res.json({ message: "신청곡 등록 완료!" });
  } catch (e) {
    res.status(500).json({ message: "서버 오류" });
  }
});

// 오늘의 신청곡 목록 조회 API
// GET /songs/today
router.get("/today", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    // 오늘 날짜와 일치하는 신청곡 모두 조회
    const songs = await Song.findAll({
      where: { date: today },
      include: [{ model: User, attributes: ["userId"] }], // 신청자 ID 포함
      order: [["id", "DESC"]], // 최신순
    });
    res.json(songs);
  } catch (e) {
    res.status(500).json({ message: "서버 오류" });
  }
});

// 전체 신청곡 목록 조회 API
// GET /songs/all
router.get("/all", async (req, res) => {
  try {
    // 모든 신청곡 조회
    const songs = await Song.findAll({
      include: [{ model: User, attributes: ["userId"] }],
      order: [["id", "DESC"]],
    });
    res.json(songs);
  } catch (e) {
    res.status(500).json({ message: "서버 오류" });
  }
});

// 내 신청곡 목록 조회 API
// GET /songs/my/:userId
router.get("/my/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ where: { userId: req.params.userId } });
    if (!user) return res.json([]);
    // 해당 사용자의 신청곡만 조회
    const songs = await Song.findAll({
      where: { UserId: user.id },
      order: [["id", "DESC"]],
    });
    res.json(songs);
  } catch (e) {
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
