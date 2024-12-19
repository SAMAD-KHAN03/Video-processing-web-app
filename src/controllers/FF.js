const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const db = require("../DB");
const { pipeline } = require("node:stream/promises");
// const { createReadStream } = require("node:fs");
const streams = require("node:stream/promises");
const makeThumbnail = async (fullpath, thumbnailPath) => {
  const process = spawn("ffmpeg", [
    "-i",
    fullpath,
    "-ss",
    "00:00:05",
    "-vframes",
    "1",
    thumbnailPath,
  ]);
  // Wait for the FFmpeg process to complete
  await new Promise((resolve, reject) => {
    process.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg process failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
};
const getDimension = async (fullpath) => {
  return new Promise((resolve, reject) => {
    const process = spawn("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-of",
      "csv=p=0", // Output in CSV format, without keys
      fullpath,
    ]);

    let dimensions = "";
    process.stdout.on("data", (chunk) => {
      dimensions += chunk.toString();
    });
    process.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg process failed with code ${code}`));
      } else {
        dimensions = dimensions.replace(/\s/g, "").split(",");
        resolve({ width: dimensions[1], height: dimensions[0] });
      }
    });
    process.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });
  });
};
const getAudio = async (req, res, handleErr) => {
  const videoId = req.params.get("videoId");
  db.update();
  const video = db.videos.find((video) => video.videoId === videoId);

  if (!video) {
    return handleErr({ status: 404, message: "Video not found" });
  }

  if (video.extractedAudio) {
    return handleErr({
      status: 400,
      message: "The audio has already been extracted.",
    });
  }

  const inputfile = `./storage/${videoId}/original.${video.extension}`;
  const outputFilePath = `./storage/${videoId}/original.aac`;

  try {
    await new Promise((resolve, reject) => {
      const process = spawn("ffmpeg", [
        "-i",
        inputfile,
        "-vn",
        "-ar",
        "44100",
        "-ac",
        "2",
        "-b:a",
        "192k",
        outputFilePath,
      ]);

      process.on("close", (code) => {
        if (code !== 0) {
          reject(new Error("FFmpeg process failed."));
        } else {
          resolve();
        }
      });

      process.on("error", (err) => {
        reject(err);
      });
    });
    // Verify file existence and stats
    const stats = await fs.stat(outputFilePath);
    if (stats) {
      console.log("File created successfully:", outputFilePath);
      video.extractedAudio = true; // Update the video metadata
      db.save();
      console.log("Audio file sent successfully!");
    } else {
      throw new Error("File creation failed despite FFmpeg process success.");
    }
  } catch (error) {
    console.error("Error:", error.message);
    handleErr({ status: 500, message: "Error processing the audio file." });
  }
};
const resize = (originalVideoPath, targetVideoPath, width, height) => {
  return new Promise((resolve, reject) => {
    // ffmpeg -i video.mp4 -vf scale=320:240 -c:a copy video-320x240.mp4
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      originalVideoPath,
      "-vf",
      `scale=${width}x${height}`,
      "-c:a",
      "copy",
      "-threads",
      "2",
      "-loglevel",
      "error",
      "-y",
      targetVideoPath,
    ]);

    ffmpeg.stderr.on("data", (data) => {
      console.log(data.toString("utf8"));
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(`FFmpeg existed with this code: ${code}`);
      }
    });

    ffmpeg.on("error", (err) => {
      reject(err);
    });
  });
};

const FF = { makeThumbnail, getDimension, getAudio, resize };
module.exports = FF;
