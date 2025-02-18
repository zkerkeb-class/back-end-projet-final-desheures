const albumValidation = require("./albumValidation");
const artistValidation = require("./artistValidation");
const audioValidation = require("./audioValidation");
const userValidation = require("./userValidation");

module.exports = {
  album: albumValidation,
  artist: artistValidation,
  audio: audioValidation,
  user: userValidation
};
