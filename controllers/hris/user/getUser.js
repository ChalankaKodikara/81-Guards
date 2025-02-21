const { sequelize } = require("../../../config/database");

const getUserByIDORName = async (req, res) => {
  let connection;

  try {
    const { id } = req.query;

    // Validate if the id is provided
    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    // Get database connection from the pool
    connection = await sequelize.connectionManager.pool.getConnection();

    // Retrieve user by id
    const [result] = await sequelize.query(
      `SELECT u.id, u.employee_no, u.username, u.password, u.employee_status, u.user_role, e.employee_fullname 
       FROM user u 
       JOIN employee e ON u.employee_no = e.employee_no 
       WHERE u.id = ?`,
      [id]
    );

    // Check if user data is found
    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send success response
    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error executing query:", error);

    // Send error response
    res.status(500).send("Internal Server Error");
  } finally {
    // Release connection back to the pool
    if (connection) {
      connection.release();
    }
  }
};
const getAllUsers = async (req, res) => {
  try {
    // SQL query to select all user data except the password
    const query = `
      SELECT 
        id, 
        employee_no, 
        username, 
        employee_status, 
        user_role, 
        user_type
      FROM 
        user
    `;

    // Execute the query using Sequelize
    const rows = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    // Debugging log to verify the data
    console.log("Fetched rows from database:", rows);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    // Send the entire result set as the response
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getPermissionsByRoleId = async (req, res) => {
  let connection;

  try {
    const { role_id } = req.query;

    if (!role_id) {
      res.status(400).json({ error: "Role ID is required" });
      return;
    }

    connection = await sequelize.connectionManager.pool.getConnection();

    const query = `
      SELECT p.id, p.permission_name
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ?;
    `;

    const [rows] = await sequelize.query(query, [role_id]);

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching permissions by role ID:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};


module.exports = { getUserByIDORName, getAllUsers , getPermissionsByRoleId};
