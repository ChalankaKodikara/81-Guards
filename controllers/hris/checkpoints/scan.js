const ScannedDetail = require("../../../models/ScannedDetails");
const Checkpoint = require("../../../models/Checkpoints");

const saveScannedDetails = async (req, res) => {
  try {
    const { employee_no, checkpoint_id, location_name, scan_date, scan_time } =
      req.body;

    // Validate input data
    if (
      !employee_no ||
      !checkpoint_id ||
      !location_name ||
      !scan_date ||
      !scan_time
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the checkpoint exists
    const checkpoint = await Checkpoint.findByPk(checkpoint_id);
    if (!checkpoint) {
      return res.status(404).json({ message: "Checkpoint not found." });
    }

    // Save scanned details
    const scannedDetail = await ScannedDetail.create({
      employee_no,
      checkpoint_id,
      location_name,
      scan_date,
      scan_time,
    });

    // Send response
    res.status(201).json({
      message: "Scanned details saved successfully.",
      scannedDetail,
    });
  } catch (error) {
    console.error("Error saving scanned details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getAllScans = async (req, res) => {
  try {
    const scanDetails = await ScannedDetail.findAll();
    res.status(200).json({
      message: "All scan details retrieved successfully.",
      scanDetails,
    });
  } catch (error) {
    console.error("Error fetching all scan details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getScansByClient = async (req, res) => {
  try {
    const { client_id } = req.query;

    if (!client_id) {
      return res.status(400).json({ message: "client_id is required." });
    }

    // Find all checkpoints for the given client_id
    const checkpoints = await Checkpoint.findAll({ where: { client_id } });
    if (!checkpoints || checkpoints.length === 0) {
      return res
        .status(404)
        .json({ message: "No checkpoints found for this client." });
    }

    // Extract checkpoint IDs
    const checkpointIds = checkpoints.map((checkpoint) => checkpoint.id);

    // Find scanned details for the checkpoints
    const scanDetails = await ScannedDetail.findAll({
      where: { checkpoint_id: checkpointIds },
    });

    res.status(200).json({
      message: "Scan details retrieved successfully for the client.",
      scanDetails,
    });
  } catch (error) {
    console.error("Error fetching scan details by client ID:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
const getScansByEmployee = async (req, res) => {
  try {
    const { employee_no } = req.query;

    if (!employee_no) {
      return res.status(400).json({ message: "employee_no is required." });
    }

    const scanDetails = await ScannedDetail.findAll({ where: { employee_no } });

    if (!scanDetails || scanDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "No scan details found for this employee." });
    }

    res.status(200).json({
      message: "Scan details retrieved successfully for the employee.",
      scanDetails,
    });
  } catch (error) {
    console.error("Error fetching scan details by employee:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  saveScannedDetails,
  getScansByEmployee,
  getScansByClient,
  getAllScans,
};
