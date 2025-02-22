const Client = require("../../../models/Client");

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

module.exports = { getClients };
