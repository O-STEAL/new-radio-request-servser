require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize } = require("./models");
const errorHandler = require("./utils/errorHandler");

const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/songs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/songs", songRoutes);

// 전역 에러 핸들러
app.use(errorHandler);

const PORT = 4000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
  });
});
