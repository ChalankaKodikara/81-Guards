const Checkpoint = require("../../../models/Checkpoints");
const Client = require("../../../models/Client");
const Employee = require("../../../models/Employee");
const EmployeeClientAssignment = require("../../../models/EmployeeClientAssignment");

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


module.exports = {
  getCheckpointDetails,
  getCheckpointsByClient,
  getCheckpointWithEmployees,
};
