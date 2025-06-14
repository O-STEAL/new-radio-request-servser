// 메인 서버 파일. 서버를 실행하고 라우터를 연결하는 역할

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize } = require("./models"); // DB 연결 및 모델 가져오기

const authRoutes = require("./routes/auth"); // 회원 관련 라우터
const songRoutes = require("./routes/songs"); // 신청곡 관련 라우터

const app = express();
app.use(cors()); // CORS 허용
app.use(bodyParser.json()); // JSON 형식 요청 바디 파싱

// API 엔드포인트 연결
app.use("/auth", authRoutes); // /auth/로 시작하는 회원 관련 API
app.use("/songs", songRoutes); // /songs/로 시작하는 신청곡 관련 API

const PORT = 4000;

// DB와 동기화 후 서버 시작
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
  });
});
