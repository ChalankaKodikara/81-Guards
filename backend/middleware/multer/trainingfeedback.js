const multer = require("multer");

const trainingfeedback = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
    fileFilter: function (req, file, cb) {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'), false); 
      }
    },
  });
  
  module.exports = trainingfeedback.array("training_feedback", 1); 
  