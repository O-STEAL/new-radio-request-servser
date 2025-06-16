const { Sequelize, DataTypes } = require("sequelize");

// SQLite DB 연결
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
});

// 유저
const User = sequelize.define("User", {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
});

// 신청곡
const Song = sequelize.define("Song", {
  date: { type: DataTypes.STRING, allowNull: false },
  isAnonymous: { type: DataTypes.BOOLEAN, defaultValue: false },
  hasStory: { type: DataTypes.BOOLEAN, defaultValue: false },
  story: { type: DataTypes.TEXT },
  songLink: { type: DataTypes.STRING },
  songTitle: { type: DataTypes.STRING },
});

User.hasMany(Song);
Song.belongsTo(User);

module.exports = { sequelize, User, Song };
