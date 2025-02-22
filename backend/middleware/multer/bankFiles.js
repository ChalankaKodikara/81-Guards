// middleware/multer/bankFiles.js
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 5, // Limit to 5 files in a single request
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true); // Accept only PDF files
    } else {
      cb(new Error("Only PDF files are allowed"), false); // Reject other files
    }
  },
}).single("file"); // Accept only one file with the field name 'file'


module.exports = upload;
