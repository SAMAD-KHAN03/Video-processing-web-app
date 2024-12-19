const fs = require("node:fs/promises");
const deleteFile = async (path) => {
  try {
    await fs.unlink(path);
  } catch (error) {}
};

const deleteDir = async (path) => {
  try {
    await fs.rm(path, { recursive: true });
  } catch (error) {}
};
const util = { deleteDir, deleteFile };
module.exports = util;
