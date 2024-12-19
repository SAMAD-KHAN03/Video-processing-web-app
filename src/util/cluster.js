const cluster = require("node:cluster");
const JobQueue = require("../util/JobQueue");

if (cluster.isPrimary) {
  const jobs = new JobQueue();
  let numCPUs = require("node:os").availableParallelism();
  while (numCPUs--) {
    cluster.fork();
  }
  cluster.on("message", (worker, message) => {
    if (message.messageType === "new-resize") {
      const { width, height, videoId } = message.data;
      jobs.enqueue({
        type: "resize",
        videoId,
        width,
        height,
      });
    }
  });
  cluster.on("exit", (worker, code, signal) => {
    cluster.fork();
  });
} else {
  require("../index.js");
}
/**; */
