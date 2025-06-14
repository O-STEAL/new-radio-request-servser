// DB와 모델 정의하는 파일

const { Sequelize, DataTypes } = require("sequelize");

// SQLite DB 연결
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite", // 파일로 저장
});

// 유저 모델
const User = sequelize.define("User", {
  username: { type: DataTypes.STRING, unique: true, allowNull: false }, // 유저 ID (중복 X)
  name: { type: DataTypes.STRING, allowNull: false }, // 유저 이름
  password: { type: DataTypes.STRING, allowNull: false }, // 비밀번호 (암호화 X)
});

// 신청곡 모델
const Song = sequelize.define("Song", {
  date: { type: DataTypes.STRING, allowNull: false }, // 신청한 날짜 (YYYY-MM-DD)
  isAnonymous: { type: DataTypes.BOOLEAN, defaultValue: false }, // 익명 여부
  hasStory: { type: DataTypes.BOOLEAN, defaultValue: false }, // 사연 여부
  story: { type: DataTypes.TEXT }, // 사연 내용
  link: { type: DataTypes.STRING }, // 곡 링크
});

// 1명의 유저가 여러 곡을 가질 수 있다
User.hasMany(Song);
Song.belongsTo(User);

module.exports = { sequelize, User, Song };
