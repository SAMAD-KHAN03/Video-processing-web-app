const path = require("node:path");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
// const util = require("../util/deletion");
const { pipeline } = require("node:stream/promises");
const { spawn } = require("node:child_process");
const db = require("../DB");
const FF = require("./FF");
const util = require("../util/deletion");

const getVideos = async (req, res, handleErr) => {
  db.update();
  const videos = db.videos.filter((video) => {
    return video.userId === req.userId;
  });
  res.status(200).json(videos);
};
const getAssets = async (req, res, handleErr) => {
  try {
    db.update();
    const videoId = req.params.get("videoId");
    const type = req.params.get("type");
    const video = db.videos.find((video) => video.videoId === videoId);
    console.log(video.extension);
    if (!video) {
      res.handleErr({ status: 404, message: "no videos" });
    }
    console.log(type);
    let file;
    let filename;
    let mimeType;
    switch (type) {
      case "thumbnail":
        file = await fs.open(`./storage/${videoId}/thumbnail.jpg`, "r");
        mimeType = "images/jpeg";
        break;
      case "original":
        file = await fs.open(
          `./storage/${videoId}/original.${video.extension}`,
          "r"
        );
        mimeType = "video/mp4";
        filename = `${video.name}.${video.extension}`;
        break;
      case "resize":
        const dimensions = req.params.get("dimensions");
        file = await fs.open(
          `./storage/${videoId}/${dimensions}.${video.extension}`,
          "r"
        );
        mimeType = "video/mp4";
        filename = `${dimensions}.${video.extension}`;
        break;
      case "audio":
        file = await fs.open(`./storage/${videoId}/original.aac`, "r");
        mimeType = "audio/aac";
        filename = `${video.name}-audio.aac`;
        break;
      default:
        break;
    }
    let size = (await file.stat()).size;
    const fileStream = file.createReadStream();
    if (type !== "thumbnail") {
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    }
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", size);
    await pipeline(fileStream, res);
    file.close(); //if we don't do this it will create a memory issue
  } catch (error) {
    console.log(error);
  }
};
const uploadVideo = async (req, res, handleErr) => {
  const specifiedFileName = req.headers.filename;
  const details = path.parse(specifiedFileName);
  const extension = details.ext; //substring because path.extname return .<extension> to remove .
  const name = details.name;
  const videoId = crypto.randomBytes(4).toString("hex"); //32bits
  try {
    await fs.mkdir(`./storage/${videoId}`);
    const fullpath = `./storage/${videoId}/original.${extension}`;
    const file = fs.open(fullpath, "w");
    const writeStream = (await file).createWriteStream();
    const thumbnailPath = `storage/${videoId}/thumbnail.jpg`;
    await pipeline(req, writeStream);
    await FF.makeThumbnail(fullpath, thumbnailPath);
    const dimensions = await FF.getDimension(fullpath);
    console.log(dimensions);
    db.update();
    db.videos.unshift({
      id: db.videos.length,
      videoId,
      name,
      extension,
      userId: req.userId,
      extractedAudio: false,
      resizes: {},
      dimensions,
    });
    db.save();
    res.status(200).json({
      status: "success",
      message: "Video uploaded successfully",
    });
  } catch (e) {
    const path = `./storage/${videoId}`;
    util.deleteDir(path);
  }
};
// Resize a video file (creates a new video file)
const resizeVideo = async (req, res, handleErr) => {
  const videoId = req.body.videoId;
  const width = Number(req.body.width);
  const height = Number(req.body.height);

  db.update();
  const video = db.videos.find((video) => video.videoId === videoId);
  video.resizes[`${width}x${height}`] = { processing: true };
  db.save();
  //sending message to parent
  process.send({ messageType: "new-resize", data: { width, height, videoId } });

  res.status(200).json({
    status: "success",
    message: "The video is now being processed!",
  });
};
const controller = {
  uploadVideo,
  getVideos,
  getAssets,
  resizeVideo,
};
module.exports = controller;
