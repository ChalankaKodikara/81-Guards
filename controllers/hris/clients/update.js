const Client = require("../../../models/Client");

const updateClient = async (req, res) => {
  try {
    const { id } = req.query; // Extract the id from query parameters
    const { name, email, phone, address } = req.body; // Fields to update from request body

    // Check if ID is provided in the query
    if (!id) {
      return res.status(400).json({ message: "Client ID is required in query parameters." });
    }

    // Find the client by ID
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: `Client with ID ${id} not found.` });
    }

    // Update the client record with provided fields
    await client.update({ name, email, phone, address });

    return res.status(200).json({
      message: "Client updated successfully.",
      client,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while updating the client.",
      error: error.message,
    });
  }
};

module.exports = { updateClient };
