// 회원가입, 로그인, 아이디 중복체크 API 라우터
const express = require("express");
const { User } = require("../models");
const router = express.Router();

/**
 * 회원가입 API
 * POST /auth/register
 */
router.post("/register", async (req, res) => {
  // 프론트에서 보낸 값 구조 분해
  const { username, name, password } = req.body;
  try {
    // 필수값 누락 시 에러 반환
    if (!username || !name || !password)
      return res.status(400).json({ message: "필수값 누락" });

    // username이 이미 있는지 확인
    const exists = await User.findOne({ where: { username } });
    if (exists)
      return res.status(400).json({ message: "이미 존재하는 아이디입니다." });

    // 새 유저 등록
    await User.create({ username, name, password });

    res.json({ message: `${name}님, 환영합니다!` });
  } catch (e) {
    res.status(500).json({ message: "서버 오류" });
  }
});

/**
 * 로그인 API
 * POST /auth/login
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    // 입력받은 username, password가 일치하는 유저가 있는지 확인
    const user = await User.findOne({ where: { username, password } });
    if (!user)
      return res.status(401).json({ message: "아이디 / 비밀번호 오류" });

    res.json({
      message: `${user.name}님, 환영합니다!`,
      username: user.username,
      name: user.name,
    });
  } catch (e) {
    res.status(500).json({ message: "서버 오류" });
  }
});

/**
 * username 중복 체크 API
 * POST /auth/check-id
 */
router.post("/check-id", async (req, res) => {
  const { username } = req.body;
  try {
    // 해당 username이 이미 존재하는지 확인
    const exists = await User.findOne({ where: { username } });
    res.json({ exists: !!exists }); // true/false 반환
  } catch (e) {
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
