const { sequelize } = require("../../../../config/database");
const EmployeeClientAssignment = require("../../../../models/EmployeeClientAssignment");
const Employee = require("../../../../models/Employee");
const { QueryTypes } = require("sequelize");
const Checkpoint = require("../../../../models/Checkpoints");

// Assign multiple employees to a client
const addEmployeeToClient = async (req, res) => {
  try {
    const { client_id, employee_numbers } = req.body;

    if (
      !client_id ||
      !Array.isArray(employee_numbers) ||
      employee_numbers.length === 0
    ) {
      return res.status(400).json({
        message: "Client ID and an array of Employee Numbers are required.",
      });
    }

    // Ensure all employees exist before assignment
    const existingEmployees = await Employee.findAll({
      where: { employee_no: employee_numbers },
    });

    if (existingEmployees.length !== employee_numbers.length) {
      return res.status(400).json({
        message: "Some employee numbers do not exist.",
      });
    }

    const newAssignments = await Promise.all(
      employee_numbers.map((employee_no) =>
        EmployeeClientAssignment.create({ client_id, employee_no })
      )
    );

    return res.status(201).json({
      message: "Employees assigned to client successfully.",
      assignments: newAssignments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while assigning employees to the client.",
      error: error.message,
    });
  }
};

const getEmployeesByClientId = async (req, res) => {
  try {
    const { client_id } = req.query;

    if (!client_id) {
      return res.status(400).json({ message: "Client ID is required." });
    }

    // ✅ Raw SQL Query to fetch employees assigned to a client
    const query = `
      SELECT 
        e.employee_no, 
        e.name, 
        e.contact_number, 
        e.employee_category, 
        e.department, 
        e.designation, 
        e.work_location
      FROM employee e
      JOIN EmployeeClientAssignments a ON e.employee_no = a.employee_no
      WHERE a.client_id = :client_id
    `;

    // Execute the raw query
    const employees = await sequelize.query(query, {
      replacements: { client_id },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!employees.length) {
      return res.status(404).json({ message: "No employees found for this client." });
    }

    return res.status(200).json({
      message: "Employees retrieved successfully.",
      employees,
    });
  } catch (error) {
    console.error("Error retrieving employees for the client:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving employees for the client.",
      error: error.message,
    });
  }
};


// Update employee assignments for a client
const updateEmployeeAssignment = async (req, res) => {
  try {
    const { client_id, employee_numbers } = req.body;

    if (
      !client_id ||
      !Array.isArray(employee_numbers) ||
      employee_numbers.length === 0
    ) {
      return res.status(400).json({
        message: "Client ID and an array of Employee Numbers are required.",
      });
    }

    // Remove existing assignments
    await EmployeeClientAssignment.destroy({ where: { client_id } });

    // Ensure all employees exist
    const existingEmployees = await Employee.findAll({
      where: { employee_no: employee_numbers },
    });

    if (existingEmployees.length !== employee_numbers.length) {
      return res.status(400).json({
        message: "Some employee numbers do not exist.",
      });
    }

    // Add new assignments
    const updatedAssignments = await Promise.all(
      employee_numbers.map((employee_no) =>
        EmployeeClientAssignment.create({ client_id, employee_no })
      )
    );

    return res.status(200).json({
      message: "Employee assignments updated successfully.",
      assignments: updatedAssignments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while updating employee assignments.",
      error: error.message,
    });
  }
};

// Delete a specific employee-client assignment
const deleteEmployeeAssignment = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res
        .status(400)
        .json({ message: "Assignment ID is required as a query parameter." });
    }

    const assignment = await EmployeeClientAssignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    await assignment.destroy();

    return res
      .status(200)
      .json({ message: "Employee assignment deleted successfully." });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while deleting the employee assignment.",
      error: error.message,
    });
  }
};

// Get employees who are not assigned to any client
const getUnassignedEmployees = async (req, res) => {
  try {
    const unassignedEmployees = await sequelize.query(
      `SELECT e.employee_no, e.name, e.contact_number, e.employee_category, e.department, e.designation, e.work_location
       FROM employee e
       LEFT JOIN EmployeeClientAssignment a ON e.employee_no = a.employee_no
       WHERE a.employee_no IS NULL`,
      { type: QueryTypes.SELECT }
    );

    if (unassignedEmployees.length === 0) {
      return res
        .status(404)
        .json({ message: "No unassigned employees found." });
    }

    return res.status(200).json(unassignedEmployees);
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while retrieving unassigned employees.",
      error: error.message,
    });
  }
};

module.exports = {
  addEmployeeToClient,
  getEmployeesByClientId,
  updateEmployeeAssignment,
  deleteEmployeeAssignment,
  getUnassignedEmployees,
};
