const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 5, // Maximum 5 files
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Only PDF files are allowed"), false); // Reject the file
    }
  },
});

module.exports = upload.array("files", 5); // Assuming the field name is "files"
