// multer/employeeProfessionalFiles.js
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit each file size to 10 MB
    files: 5, // Limit the total number of files to 5
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true); // Accept only PDF files
    } else {
      cb(new Error("Only PDF files are allowed"), false); // Reject non-PDF files
    }
  },
}).fields([
  { name: "professionalDetails[0][files]", maxCount: 1 },
  { name: "professionalDetails[1][files]", maxCount: 1 },
  { name: "professionalDetails[2][files]", maxCount: 1 },
  { name: "professionalDetails[3][files]", maxCount: 1 },
  { name: "professionalDetails[4][files]", maxCount: 1 },
]);

module.exports = upload;
