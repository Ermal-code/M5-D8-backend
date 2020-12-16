const { readJSON, writeJSON } = require("fs-extra");
const { join } = require("path");

const attendeesFilePath = join(
  __dirname,
  "../services/attendees/attendees.json"
);

const readDB = async (filePath) => {
  try {
    const fileJson = await readJSON(filePath);
    return fileJson;
  } catch (error) {
    throw new Error(error);
  }
};

const writeDB = async (filePath, fileData) => {
  try {
    await writeJSON(filePath, fileData);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getAttendees: async () => readDB(attendeesFilePath),
  writeAttendees: async (attendeesData) =>
    writeDB(attendeesFilePath, attendeesData),
};
