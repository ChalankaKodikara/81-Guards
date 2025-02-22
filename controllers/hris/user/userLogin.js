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

    // Check if user exists
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

    // // Store refresh token
    // const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    // await sequelize.query(
    //   `INSERT INTO refresh_tokens (employee_no, token, expires_at) 
    //    VALUES (?, ?, ?)
    //    ON DUPLICATE KEY UPDATE token = ?, expires_at = ?`,
    //   {
    //     replacements: [
    //       user.employee_no || user.username,
    //       refreshToken,
    //       expiresAt,
    //       refreshToken,
    //       expiresAt,
    //     ],
    //     type: sequelize.QueryTypes.INSERT,
    //   }
    // );   

    return res.status(200).json({
      employee_no: user.employee_no || null,
      username: user.username,
      user_type: user.user_type,
      user_token: accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { loginUser };
