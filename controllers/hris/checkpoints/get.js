const Checkpoint = require("../../../models/Checkpoints");
const Client = require("../../../models/Client");
const Employee = require("../../../models/Employee");
const EmployeeClientAssignment = require("../../../models/EmployeeClientAssignment");
const path = require("path");
const fs = require("fs");
const ScannedDetails = require("../../../models/ScannedDetails"); // Import the Sequelize model

const getCheckpointDetails = async (req, res) => {
  try {
    const { checkpoint_id } = req.query;

    // Validate the query parameter
    if (!checkpoint_id) {
      return res.status(400).json({ message: "checkpoint_id is required." });
    }

    // Fetch the checkpoint details from the database
    const checkpoint = await Checkpoint.findOne({
      where: { id: checkpoint_id },
    });

    // Check if the checkpoint exists
    if (!checkpoint) {
      return res.status(404).json({ message: "Checkpoint not found." });
    }

    // Respond with the checkpoint details
    res.status(200).json({
      message: "Checkpoint details retrieved successfully.",
      checkpoint,
    });
  } catch (error) {
    console.error("Error fetching checkpoint details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getCheckpointsByClient = async (req, res) => {
  try {
    const { client_id } = req.query;

    // Validate client_id in query parameters
    if (!client_id) {
      return res.status(400).json({ message: "client_id is required." });
    }

    // Fetch client details
    const client = await Client.findOne({
      where: { id: client_id },
      attributes: ["id", "name", "email", "phone", "address"], // Select required fields
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    // Fetch all checkpoints associated with the client
    const checkpoints = await Checkpoint.findAll({
      where: { client_id },
    });

    // Send response with both client details and checkpoints data
    res.status(200).json({
      message: "Checkpoints retrieved successfully.",
      client,
      checkpoints,
    });
  } catch (error) {
    console.error("Error fetching checkpoints:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getCheckpointWithEmployees = async (req, res) => {
  try {
    const { checkpoint_id } = req.query;

    if (!checkpoint_id) {
      return res.status(400).json({ message: "Checkpoint ID is required." });
    }

    // Fetch the checkpoint details along with the client_id
    const checkpoint = await Checkpoint.findOne({
      where: { id: checkpoint_id },
    });

    if (!checkpoint) {
      return res.status(404).json({ message: "Checkpoint not found." });
    }

    // Get all assigned employees from `employeeclientassignments`
    const assignedEmployees = await EmployeeClientAssignment.findAll({
      where: { client_id: checkpoint.client_id }, // Get employees by client_id
      attributes: ["employee_no"], // Only get employee numbers
    });

    // Extract employee numbers from result
    const employeeNos = assignedEmployees.map((emp) => emp.employee_no);

    // Fetch full employee details from the Employee table
    const employees = await Employee.findAll({
      where: { employee_no: employeeNos }, // Filter employees by assigned employee_no
      attributes: [
        "employee_no",
        "name",
        "nic",
        "contact_number",
        "designation",
        "department",
        "work_location",
        "active_status",
      ],
    });

    return res.status(200).json({
      message: "Checkpoint details retrieved successfully.",
      checkpoint: {
        id: checkpoint.id,
        name: checkpoint.name,
        client_id: checkpoint.client_id,
        location_name: checkpoint.location_name,
        location_address: checkpoint.location_address,
        qr_code_url: checkpoint.qr_code_url,
        createdAt: checkpoint.createdAt,
        updatedAt: checkpoint.updatedAt,
        employees: employees, // Include assigned employees
      },
    });
  } catch (error) {
    console.error("Error fetching checkpoint details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getCheckpointQRCode = async (req, res) => {
  try {
    const { checkpoint_id } = req.query;

    if (!checkpoint_id) {
      return res.status(400).json({ message: "Checkpoint ID is required." });
    }

    // Construct the QR code filename
    const qrFileName = `checkpoint-${checkpoint_id}.png`;
    const qrFilePath = path.join(
      __dirname,
      "../../../public/qr-codes",
      qrFileName
    );

    // Check if the file exists
    if (!fs.existsSync(qrFilePath)) {
      return res
        .status(404)
        .json({ message: "QR code not found for this checkpoint." });
    }

    // Serve the file
    return res.sendFile(qrFilePath);
  } catch (error) {
    console.error("Error retrieving QR code:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
// GET Scan Details by Checkpoint ID
const getcheckpointhistory = async (req, res) => {
  try {
    const { checkpoint_id } = req.query;

    if (!checkpoint_id) {
      return res.status(400).json({ message: "Checkpoint ID is required." });
    }

    // Fetch scan details based on checkpoint_id
    const scanDetails = await ScannedDetails.findAll({
      where: { checkpoint_id },
      attributes: [
        "id",
        "employee_no",
        "checkpoint_id",
        "location_name",
        "scan_date",
        "scan_time",
        "created_at",
      ],
      order: [
        ["scan_date", "DESC"],
        ["scan_time", "DESC"],
      ], // Order by latest scan first
    });

    if (!scanDetails.length) {
      return res.status(200).json({
        message: "No scan details found for this checkpoint.",
        scanDetails: [],
      });
    }

    return res.status(200).json({
      message: "Scan details retrieved successfully.",
      scanDetails,
    });
  } catch (error) {
    console.error("Error fetching scan details:", error);
    return res.status(500).json({
      message: "Server error occurred while retrieving scan history.",
      error: error.message,
    });
  }
};
module.exports = {
  getCheckpointDetails,
  getCheckpointsByClient,
  getCheckpointWithEmployees,
  getCheckpointQRCode,
  getcheckpointhistory,
};
