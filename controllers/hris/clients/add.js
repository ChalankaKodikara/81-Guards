const { sequelize } = require("../../../config/database");
const Client = require("../../../models/Client");
const User = require("../../../models/User");
const bcrypt = require("bcrypt");
const Employee = require("../../../models/Employee");
const EmployeeClientAssignment = require("../../../models/EmployeeClientAssignment");

const addClient = async (req, res) => {
  let transaction;

  try {
    const { name, email, phone, address, employee_numbers } = req.body;

    // Validation: Ensure required fields
    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ message: "Name, email, and phone are required." });
    }

    // Start a transaction
    transaction = await sequelize.transaction();

    // Create Client Record
    const newClient = await Client.create(
      { name, email, phone, address },
      { transaction }
    );

    // Generate employee_no format "CL<client_id>"
    const employee_no = `CL${newClient.id}`;

    // Hash password (default "123456")
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // Insert User Record for Client
    await User.create(
      {
        employee_no,
        username: email,
        password: hashedPassword,
        employee_status: "ACTIVE",
        user_role: 3, // Assuming 3 represents "client"
        user_type: "client",
        employment: "No",
      },
      { transaction }
    );

    // If employee_numbers exist, assign them to the client
    if (Array.isArray(employee_numbers) && employee_numbers.length > 0) {
      // Ensure all employees exist before assignment
      const existingEmployees = await Employee.findAll({
        where: { employee_no: employee_numbers },
        attributes: ["employee_no"],
      });

      const existingEmployeeNos = existingEmployees.map(
        (emp) => emp.employee_no
      );

      if (existingEmployeeNos.length !== employee_numbers.length) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Some employee numbers do not exist.",
        });
      }

      // Assign employees to client
      await Promise.all(
        existingEmployeeNos.map((employee_no) =>
          EmployeeClientAssignment.create(
            { client_id: newClient.id, employee_no },
            { transaction }
          )
        )
      );
    }

    // Commit transaction
    await transaction.commit();

    return res.status(201).json({
      message:
        "Client added successfully, user created, and employees assigned.",
      client: newClient,
    });
  } catch (error) {
    // Rollback transaction in case of an error
    if (transaction) await transaction.rollback();

    return res.status(500).json({
      message: "An error occurred while adding the client.",
      error: error.message,
    });
  }
};

module.exports = { addClient };
