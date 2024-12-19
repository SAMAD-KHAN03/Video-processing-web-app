// Controllers
const User = require("./controllers/user");
const Video = require("./controllers/video");
const FF = require("./controllers/FF");
module.exports = (server) => {
  // ------------------------------------------------ //
  // ************ USER ROUTES ************* //
  // ------------------------------------------------ //

  // Log a user in and give them a token
  server.route("post", "/api/login", User.logUserIn);

  // Log a user out
  server.route("delete", "/api/logout", User.logUserOut);

  // Send user info
  server.route("get", "/api/user", User.sendUserInfo);

  // Update a user info
  server.route("put", "/api/user", User.updateUser);
  server.route("get", "/api/videos", Video.getVideos);
  server.route("get", "/get-video-asset", Video.getAssets);
  server.route("patch", "/api/video/extract-audio", FF.getAudio);
  server.route("put", "/api/video/resize", Video.resizeVideo);

  //file uploading
  server.route("post", "/api/upload-video", Video.uploadVideo);
};
///get-video-asset?videoId=ca014b65&type=audio
