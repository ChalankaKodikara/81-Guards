const express = require("express");
const router = express.Router();
const upload = require("../../middleware/multer/upload"); // Import multer config
const { bulkUploadEmployees } = require("../../controllers/hris/bulk");

router.post("/bulk-upload", upload.single("file"), bulkUploadEmployees);

module.exports = router;
