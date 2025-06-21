const { User } = require("../models");

exports.register = async (req, res, next) => {
  const { username, name, password } = req.body;
  try {
    if (!username || !name || !password)
      return res.status(400).json({ message: "필수값 누락" });
    const exists = await User.findOne({ where: { username } });
    if (exists)
      return res.status(400).json({ message: "이미 존재하는 아이디입니다." });
    await User.create({ username, name, password });
    res.status(201).json({ message: `${name}님, 환영합니다!` });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username, password } });
    if (!user)
      return res.status(401).json({ message: "아이디 / 비밀번호 오류" });
    res.json({
      message: `${user.name}님, 환영합니다!`,
      username: user.username,
      name: user.name,
    });
  } catch (e) {
    next(e);
  }
};

exports.checkId = async (req, res, next) => {
  const { username } = req.body;
  try {
    const exists = await User.findOne({ where: { username } });
    res.json({ exists: !!exists });
  } catch (e) {
    next(e);
  }
};
