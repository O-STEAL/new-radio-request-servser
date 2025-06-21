module.exports = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "서버 오류", error: err.message });
};
