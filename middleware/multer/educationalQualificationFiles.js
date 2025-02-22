// middleware/multer/educationalQualificationFiles.js
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit each file size to 10 MB
    files: 5, // Limit the total number of files in one request
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true); // Accept only PDF files
    } else {
      cb(new Error("Only PDF files are allowed"), false); // Reject other file types
    }
  },
}).fields([
  { name: "educationDetails[0][file]", maxCount: 1 },
  { name: "educationDetails[1][file]", maxCount: 1 },
  { name: "educationDetails[2][file]", maxCount: 1 },
  { name: "educationDetails[3][file]", maxCount: 1 },
  { name: "educationDetails[4][file]", maxCount: 1 },
]);

module.exports = upload;
