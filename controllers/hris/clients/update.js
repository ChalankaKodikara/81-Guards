const Client = require("../../../models/Client");

const updateClient = async (req, res) => {
  let transaction;
  
  try {
    const { id } = req.query; // Extract the client ID from query parameters
    const { name, email, phone, address } = req.body; // Fields to update

    if (!id) {
      return res.status(400).json({ message: "Client ID is required in query parameters." });
    }

    // Start a database transaction
    transaction = await sequelize.transaction();

    // Find the client by ID
    const client = await Client.findByPk(id, { transaction });
    if (!client) {
      await transaction.rollback();
      return res.status(404).json({ message: `Client with ID ${id} not found.` });
    }

    // Check if email is being updated
    const isEmailUpdated = email && email !== client.email;

    // Update the client record
    await client.update({ name, email, phone, address }, { transaction });

    // If email is updated, update the corresponding username in the user table
    if (isEmailUpdated) {
      const employeeNo = `CL${id}`; // Generate employee_no format for clients

      // Update username in user table where employee_no matches
      await sequelize.query(
        `UPDATE user SET username = ? WHERE employee_no = ? AND user_type = 'client'`,
        {
          replacements: [email, employeeNo],
          type: sequelize.QueryTypes.UPDATE,
          transaction,
        }
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
