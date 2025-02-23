const Client = require("../../../models/Client");
const { sequelize } = require("../../../config/database");
const EmployeeClientAssignment = require("../../../models/EmployeeClientAssignment");

const updateClient = async (req, res) => {
  let transaction;

  try {
    const { id } = req.query; // Extract client ID from query parameters
    const { name, email, phone, address, employee_numbers } = req.body; // Fields to update

    if (!id) {
      return res
        .status(400)
        .json({ message: "Client ID is required in query parameters." });
    }

    // Start a database transaction
    transaction = await sequelize.transaction();

    // Find the client by ID
    const client = await Client.findByPk(id, { transaction });
    if (!client) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: `Client with ID ${id} not found.` });
    }

    // Check if email is being updated
    const isEmailUpdated = email && email !== client.email;

    // Update the client record
    await client.update({ name, email, phone, address }, { transaction });

    // Generate employee_no format for clients
    const employeeNo = `CL${id}`;

    // If email is updated, update the corresponding username in the user table
    if (isEmailUpdated) {
      await sequelize.query(
        `UPDATE user SET username = ? WHERE employee_no = ? AND user_type = 'client'`,
        {
          replacements: [email, employeeNo],
          type: sequelize.QueryTypes.UPDATE,
          transaction,
        }
      );
    }

    // Get currently assigned employees from the `employeeclientassignments` table
    const existingAssignments = await EmployeeClientAssignment.findAll({
      where: { client_id: id },
      attributes: ["employee_no"],
      transaction,
    });

    const currentEmployeeNos = existingAssignments.map(
      (emp) => emp.employee_no
    );

    // Determine which employees to remove
    const employeesToRemove = currentEmployeeNos.filter(
      (empNo) => !employee_numbers.includes(empNo)
    );

    // Remove unassigned employees from `employeeclientassignments` table
    if (employeesToRemove.length > 0) {
      await EmployeeClientAssignment.destroy({
        where: {
          client_id: id,
          employee_no: employeesToRemove,
        },
        transaction,
      });
    }

    // Determine new employees to assign
    const newEmployees = employee_numbers.filter(
      (empNo) => !currentEmployeeNos.includes(empNo)
    );

    // Insert new assignments
    if (newEmployees.length > 0) {
      await EmployeeClientAssignment.bulkCreate(
        newEmployees.map((empNo) => ({
          client_id: id,
          employee_no: empNo,
        })),
        { transaction }
      );
    }

    // Commit the transaction
    await transaction.commit();

    return res.status(200).json({
      message: "Client updated successfully.",
      client,
    });
  } catch (error) {
    // Rollback transaction if an error occurs
    if (transaction) await transaction.rollback();

    return res.status(500).json({
      message: "An error occurred while updating the client.",
      error: error.message,
    });
  }
};

module.exports = { updateClient };
