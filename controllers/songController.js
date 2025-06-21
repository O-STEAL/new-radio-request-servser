const { Song, User } = require("../models");
const { extractYoutubeVideoId, fetchYoutubeInfo } = require("../utils/youtube");

exports.submitSong = async (req, res, next) => {
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
    let channelTitle = "";
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
    next(e);
  }
};

exports.getTodaySongs = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const songs = await Song.findAll({
      where: { date: today },
      include: [{ model: User, attributes: ["username"] }],
      order: [["id", "DESC"]],
    });
    res.json(songs);
  } catch (e) {
    next(e);
  }
};

exports.getAllSongs = async (req, res, next) => {
  try {
    const songs = await Song.findAll({
      include: [{ model: User, attributes: ["username"] }],
      order: [["id", "DESC"]],
    });
    res.json(songs);
  } catch (e) {
    next(e);
  }
};

exports.getMySongs = async (req, res, next) => {
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
    next(e);
  }
};
