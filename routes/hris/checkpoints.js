const express = require("express");
const path = require("path");
const { addCheckpoint } = require("../../controllers/hris/checkpoints/add");
const {
  getCheckpointDetails,
  getCheckpointsByClient,
  getCheckpointWithEmployees,
  getCheckpointQRCode,
  getcheckpointhistory,
} = require("../../controllers/hris/checkpoints/get");
const {
  saveScannedDetails,
  getScansByEmployee,
  getScansByClient,
  getAllScans,
} = require("../../controllers/hris/checkpoints/scan");
const router = express.Router();

// POST route to add a checkpoint (database save + QR generation)
router.post("/addCheckpoint", addCheckpoint);

// Middleware for serving QR code images
router.use(
  "/qr-codes",
  express.static(path.join(__dirname, "../../../public/qr-codes"))
);

router.get("/qr-codes", getCheckpointDetails);

//scan
router.post("/saveScannedDetails", saveScannedDetails);
router.get("/getAllScans", getAllScans);
router.get("/getScansByClient", getScansByClient);
router.get("/getScansByEmployee", getScansByEmployee);
router.get("/getCheckpointsByClient", getCheckpointsByClient);
router.get("/getCheckpointWithEmployees", getCheckpointWithEmployees);
router.get("/getCheckpointQRCode", getCheckpointQRCode);
router.get("/getcheckpointhistory", getcheckpointhistory);

module.exports = router;
