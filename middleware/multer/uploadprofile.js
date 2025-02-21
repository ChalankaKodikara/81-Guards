const multer = require("multer");

// Use memory storage to keep files in memory
// Multer configuration
const uploadprofile = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB limit
      files: 1, // Maximum 1 files
    },
  });
  
  module.exports = uploadprofile.array("employee_profile", 1); // Multer expects 5 files with this field name
  