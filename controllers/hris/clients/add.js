const { sequelize } = require("../../../config/database");
const Client = require("../../../models/Client");

const addClient = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ message: "Name, email, and phone are required." });
    }

    const newClient = await Client.create({
      name,
      email,
      phone,
      address,
    });

    return res.status(201).json({
      message: "Client added successfully.",
      client: newClient,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while adding the client.",
      error: error.message,
    });
  }
};

module.exports = { addClient };
