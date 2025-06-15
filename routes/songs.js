const express = require("express");
const { Song, User } = require("../models");
const router = express.Router();

router.post("/submit", async (req, res) => {
  const { username, anonymous, link, hasStory, story } = req.body;
  try {
    if (!username || anonymous === undefined || !link || hasStory === undefined)
      return res.status(400).json({ message: "필수값 누락" });

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ message: "유저 없음" });

    const today = new Date().toISOString().slice(0, 10);

    await Song.create({
      date: today,
      anonymous: !!anonymous,
      link,
      hasStory: !!hasStory,
      story: hasStory ? story : "",
      userId: user.id,
    });

    res.status(201).json({ message: "신청곡 등록 완료!" });
  } catch (e) {
    res.status(500).json({ message: "서버 오류" });
  }
});

router.get("/today", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const songs = await Song.findAll({
      where: { date: today },
      include: [{ model: User, attributes: ["username"] }],
      order: [["id", "DESC"]],
    });
    res.json(songs);
  } catch (e) {
    res.status(500).json({ message: "서버 오류" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const songs = await Song.findAll({
      include: [{ model: User, attributes: ["username"] }],
      order: [["id", "DESC"]],
    });
    res.json(songs);
  } catch (e) {
    res.status(500).json({ message: "서버 오류" });
  }
});

router.get("/my/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
    });
    if (!user) return res.json([]);
    const songs = await Song.findAll({
      where: { userId: user.id },
      order: [["id", "DESC"]],
    });
    res.json(songs);
  } catch (e) {
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
