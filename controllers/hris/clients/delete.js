const { sequelize } = require("../../../config/database");
const Client = require("../../../models/Client");
const User = require("../../../models/User");
const EmployeeClientAssignment = require("../../../models/EmployeeClientAssignment");

const deleteClient = async (req, res) => {
  let transaction;

  try {
    const { id } = req.params;

    // Start a transaction
    transaction = await sequelize.transaction();

    // Check if client exists
    const client = await Client.findByPk(id, { transaction });

    if (!client) {
      await transaction.rollback();
      return res.status(404).json({ message: "Client not found." });
    }

    // Delete related employee-client assignments
    await EmployeeClientAssignment.destroy({
      where: { client_id: id },
      transaction,
    });

    // Delete User associated with this client
    await User.destroy({
      where: { username: client.email }, // Assuming email is used as username
      transaction,
    });

    // Delete Client record
    await Client.destroy({
      where: { id },
      transaction,
    });

    // Commit transaction
    await transaction.commit();

    return res.status(200).json({
      message: "Client and associated records deleted successfully.",
    });
  } catch (error) {
    // Rollback transaction in case of an error
    if (transaction) await transaction.rollback();

    return res.status(500).json({
      message: "An error occurred while deleting the client.",
      error: error.message,
    });
  }
};

module.exports = { deleteClient };
