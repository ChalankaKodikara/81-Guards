const Client = require("../../../models/Client");
const EmployeeClientAssignment = require("../../../models/EmployeeClientAssignment");
const Employee = require("../../../models/Employee");

const getClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    return res.status(200).json(clients);
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while fetching clients.",
      error: error.message,
    });
  }
};
const getClientsbyid = async (req, res) => {
  try {
    const { client_id } = req.query;

    if (!client_id) {
      return res.status(400).json({ message: "Client ID is required." });
    }

    // Fetch client details
    const client = await Client.findByPk(client_id);

    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    // Fetch assigned employees from `employeeclientassignments`
    const assignedEmployees = await EmployeeClientAssignment.findAll({
      where: { client_id },
      attributes: ["employee_no"],
    });

    // Extract employee numbers
    const employeeNos = assignedEmployees.map((emp) => emp.employee_no);

    // Fetch full employee details from `Employee` table
    const employees = await Employee.findAll({
      where: { employee_no: employeeNos },
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
      message: "Client details retrieved successfully.",
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        employees, // Assigned employees list
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while fetching client details.",
      error: error.message,
    });
  }
};

module.exports = { getClients, getClientsbyid };
