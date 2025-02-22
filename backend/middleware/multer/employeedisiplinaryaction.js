const multer = require("multer");


const uploaddis = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, 
      files: 5, 
    },
    fileFilter: function (req, file, cb) {
      if (file.mimetype === 'application/pdf') {
        cb(null, true); 
      } else {
        cb(new Error('Only PDF files are allowed'), false); 
      }
    },
  });
  
  module.exports = uploaddis.array("employee_disciplinary_files", 2);
  