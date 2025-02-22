const Client = require("../../../models/Client");

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    await client.destroy();

    return res.status(200).json({ message: "Client deleted successfully." });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while deleting the client.",
      error: error.message,
    });
  }
};

module.exports = { deleteClient };
