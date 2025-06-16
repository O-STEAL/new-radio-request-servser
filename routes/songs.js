const express = require("express");
const { Song, User } = require("../models");
const router = express.Router();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

function extractYoutubeVideoId(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname.includes("youtube.com")) {
      return urlObj.searchParams.get("v");
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function fetchYoutubeInfo(videoId) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) return { title: "", thumbnailUrl: "" };
    const data = await res.json();
    if (data.items && data.items[0]) {
      const snippet = data.items[0].snippet;
      return {
        title: snippet.title,
        channelTitle: snippet.channelTitle,
        thumbnailUrl:
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  } catch (e) {
    console.error("YouTube fetch error:", e);
  }
  return {
    title: "",
    thumbnailUrl: videoId
      ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      : "",
  };
}

router.post("/submit", async (req, res) => {
  const { username, anonymous, songLink, hasStory, story } = req.body;
  try {
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

    let songTitle = songLink;
    let thumbnailUrl = "";

    const videoId = extractYoutubeVideoId(songLink);
    if (videoId) {
      const info = await fetchYoutubeInfo(videoId);
      songTitle = info.title || songLink;
      channelTitle = info.channelTitle || "";
      thumbnailUrl =
        info.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }

    await Song.create({
      date: today,
      isAnonymous: !!anonymous,
      hasStory: !!hasStory,
      story: hasStory ? story : "",
      songLink,
      songTitle,
      channelTitle,
      thumbnailUrl,
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
