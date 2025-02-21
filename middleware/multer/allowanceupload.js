const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "csv") {
        cb(null, true);
      } else {
        cb(new Error("Only CSV files are allowed"), false);
      }
    },
  });

module.exports = upload;