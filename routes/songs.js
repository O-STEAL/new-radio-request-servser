const express = require("express");
const { Song, User } = require("../models");
const router = express.Router();

console.log("songs.js 파일 로드");
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
console.log("YOUTUBE_API_KEY:", YOUTUBE_API_KEY);

// 유튜브 영상 ID 추출 함수
function extractYoutubeVideoId(url) {
  const regex =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// 유튜브 영상 제목 가져오기 함수
async function fetchYoutubeTitle(videoId) {
  console.log("fetchYoutubeTitle 호출됨:", videoId);
  if (!videoId) return "";
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      console.log("유튜브 API 응답코드:", res.status, await res.text());
      return "";
    }
    const data = await res.json();
    console.log("유튜브 API 결과:", data);
    return (data.items && data.items[0] && data.items[0].snippet.title) || "";
  } catch (e) {
    console.error("YouTube fetch error:", e);
    return "";
  }
}

// POST /songs/submit
router.post("/submit", async (req, res) => {
  const { username, anonymous, songLink, hasStory, story } = req.body;
  try {
    console.log("=== /submit 라우터 진입 ===", req.body);

    if (
      !username ||
      anonymous === undefined ||
      !songLink ||
      hasStory === undefined
    )
      return res.status(400).json({ message: "필수값 누락" });

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ message: "유저 없음" });

    const today = new Date().toISOString().slice(0, 10);

    // 유튜브 영상 제목 추출
    let songTitle = "";
    const videoId = extractYoutubeVideoId(songLink);
    console.log("추출된 videoId:", videoId);
    if (videoId) {
      songTitle = await fetchYoutubeTitle(videoId);
    }
    if (!songTitle) songTitle = songLink; // 실패 시 링크 자체 저장

    await Song.create({
      date: today,
      isAnonymous: !!anonymous,
      hasStory: !!hasStory,
      story: hasStory ? story : "",
      songLink,
      songTitle,
      userId: user.id,
    });
    res.status(201).json({ message: "신청곡 등록 완료!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버 오류" });
  }
});

// GET /songs/today
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

// GET /songs/all
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

// GET /songs/my/:username
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
