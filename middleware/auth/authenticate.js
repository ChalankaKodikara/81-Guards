const jwt = require("jsonwebtoken");
const DB = require("../../config/database");
const dotenv = require("dotenv");
dotenv.config();

const authenticate = async (req, res, next) => {
  let connection;
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Not authorized, no token provided.");
    }

    const token = authHeader.split(" ")[1]; // Extract token from header

    // Establish database connection
    connection = await sequelize.connectionManager.pool.getConnection();

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user object to request for further use in route handlers
    req.user = decoded; // Assuming decoded JWT contains user information

    // Query user information based on token
    const [user] = await sequelize.query(
      `SELECT * FROM login_history WHERE token = ?`,
      [token]
    );

    if (!user || user.length === 0) {
      throw new Error("User not found or no login history.");
    }

    const updatedTime = user[0].update_time;

    const currentTime = new Date(); // Current time

    // Calculate the difference in minutes
    const differenceMilliseconds = currentTime - updatedTime;
    const differenceMinutes = Math.floor(differenceMilliseconds / (1000 * 60));

    // Check if the difference is greater than 30 minutes
    if (differenceMinutes > 30) {
      console.log("Token expired due to inactivity.");
      res.clearCookie("jwt"); // Clear the JWT cookie
      throw new Error("Token expired due to inactivity.");
    }

    // Update the last logged time to current time
    const current_time = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await sequelize.query(
      `UPDATE login_history SET update_time = ? WHERE token = ?`,
      [current_time, token]
    );

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    // Rollback transaction if there's an error
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(401).json({ error: "Not authorized." });
  } finally {
    // Release connection back to the pool
    if (connection) {
      connection.release();
    }
  }
};

module.exports = authenticate;
