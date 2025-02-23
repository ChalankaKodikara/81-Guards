const bcrypt = require("bcryptjs");
const { sequelize } = require("../../../config/database");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../utils/createToken");

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Check if user exists in the user table
    const [user] = await sequelize.query(
      `SELECT * FROM user WHERE username = ?`,
      {
        replacements: [username],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.username, user.user_role);
    const refreshToken = generateRefreshToken(user.username);

    let clientDetails = null;

    // If user is a client, fetch client details from the clients table
    if (user.user_type === "client" && user.employee_no.startsWith("CL")) {
      const clientId = user.employee_no.replace("CL", ""); // Extract client ID
      const [client] = await sequelize.query(
        `SELECT * FROM clients WHERE id = ?`,
        {
          replacements: [clientId],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (client) {
        clientDetails = {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
        };
      }
    }

    return res.status(200).json({
      employee_no: user.employee_no || null,
      username: user.username,
      user_type: user.user_type,
      user_token: accessToken,
      client_details: clientDetails, // Returns client details if user is a client
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { loginUser };
