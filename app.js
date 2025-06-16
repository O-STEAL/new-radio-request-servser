require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize } = require("./models");

const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/songs");

const app = express();
app.use(cors()); // CORS 허용
app.use(bodyParser.json()); // JSON 형식 요청 바디 파싱

// API 엔드포인트 연결
app.use("/auth", authRoutes);
app.use("/songs", songRoutes);

const PORT = 4000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
  });
});
