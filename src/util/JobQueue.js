const db = require("../DB");
const FF = require("../controllers/FF");
const util = require("./deletion");

class JobQueue {
  constructor() {
    this.jobs = [];
    this.currentJob = null;

    // Loop through the videos and find all the processing true items, and
    // add them to the queue (enqueue)
    db.update();
    db.videos.forEach((video) => {
      Object.keys(video.resizes).forEach((key) => {
        if (video.resizes[key].processing) {
          const [width, height] = key.split("x");
          this.enqueue({
            type: "resize",
            videoId: video.videoId,
            width,
            height,
          });
        }
      });
    });
  }

  enqueue(job) {
    this.jobs.push(job);
    this.executeNext();
  }

  dequeue() {
    return this.jobs.shift();
  }

  executeNext() {
    if (this.currentJob) return;
    this.currentJob = this.dequeue();
    if (!this.currentJob) return;
    this.execute(this.currentJob);
  }

  async execute(job) {
    if (job.type === "resize") {
      const { videoId, width, height } = job;

      db.update();
      const video = db.videos.find((video) => video.videoId === videoId);

      const originalVideoPath = `./storage/${video.videoId}/original.${video.extension}`;
      const targetVideoPath = `./storage/${video.videoId}/${width}x${height}.${video.extension}`;

      try {
        await FF.resize(originalVideoPath, targetVideoPath, width, height);

        db.update();
        const video = db.videos.find((video) => video.videoId === videoId);
        video.resizes[`${width}x${height}`].processing = false;
        db.save();

        console.log(
          "Done resizing! Number of jobs remaining:",
          this.jobs.length
        );
      } catch (e) {
        util.deleteFile(targetVideoPath);
      }
    }

    this.currentJob = null;
    this.executeNext();
  }
}

module.exports = JobQueue;
