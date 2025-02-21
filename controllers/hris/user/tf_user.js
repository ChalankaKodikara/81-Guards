const { sequelize } = require("../../../config/database");
const bcrypt = require("bcryptjs");

// Create a new user in TF_users table with hashed password
const createTFUser = async (req, res) => {
  let connection;

  try {
    const { employee_no, username, password, user_role } = req.body;

    // Hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get database connection from the pool
    connection = await sequelize.connectionManager.pool.getConnection();

    // Begin transaction
    await connection.beginTransaction();

    // Validate the provided role ID
    const [roleRows] = await sequelize.query(
      "SELECT id FROM roles WHERE id = ?",
      [user_role]
    );

    if (roleRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: "Invalid role ID" });
    }

    // Insert user into TF_users table
    await sequelize.query(
      "INSERT INTO TF_users (employee_no, username, password, employee_status, user_role) VALUES (?, ?, ?, ?, ?)",
      [employee_no, username, hashedPassword, "ACTIVE", user_role]
    );

    // Commit transaction
    await connection.commit();

    // Send success response
    res.status(200).json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Error executing query:", error);

    // Rollback transaction if there's an error
    if (connection) {
      await connection.rollback();
    }

    // Send error response
    res.status(500).send("Internal Server Error");
  } finally {
    // Release connection back to the pool
    if (connection) {
      connection.release();
    }
  }
};

// Add a new role with permissions to the roles and role_permissions tables
const addTFUserRole = async (req, res) => {
  let connection;
  try {
    const { role_name, role_description, permissions } = req.body;

    connection = await sequelize.connectionManager.pool.getConnection();
    await connection.beginTransaction();

    // Check if all permission IDs exist in the permissions table
    const [permissionRows] = await sequelize.query(
      "SELECT id FROM permissions WHERE id IN (?)",
      [permissions]
    );

    const existingPermissionIds = permissionRows.map((row) => row.id);

    // Check if there are missing permission IDs
    const missingPermissionIds = permissions.filter(
      (id) => !existingPermissionIds.includes(id)
    );

    if (missingPermissionIds.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        error: "Some permission IDs do not exist",
        missingPermissionIds,
      });
    }

    // Insert role details into roles table
    const [roleResult] = await sequelize.query(
      "INSERT INTO roles (role_name, role_description) VALUES (?, ?)",
      [role_name, role_description]
    );

    const roleId = roleResult.insertId;

    // Insert permissions into role_permissions table
    for (const permissionId of permissions) {
      await sequelize.query(
        "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
        [roleId, permissionId]
      );
    }

    await connection.commit();
    res.status(200).json({ success: true, message: "Role created successfully" });
  } catch (error) {
    console.error("Error executing query:", error);

    if (connection) {
      await connection.rollback();
    }

    res.status(500).send("Internal Server Error");
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Fetch all roles from the roles table
const getTFRoles = async (req, res) => {
  let connection;

  try {
    connection = await sequelize.connectionManager.pool.getConnection();

    // Query to get all roles
    const [rows] = await sequelize.query("SELECT * FROM roles");

    // Send roles data as response
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching roles data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Password reset functionality for TF_users table
const resetTFUserPassword = async (req, res) => {
  let connection;
  try {
    const { employee_no, old_password, new_password } = req.body;

    connection = await sequelize.connectionManager.pool.getConnection();

    // Fetch the user's current password
    const [userRows] = await sequelize.query(
      "SELECT password FROM TF_users WHERE employee_no = ?",
      [employee_no]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const currentPassword = userRows[0].password;

    // Compare the old password with the current password
    const isMatch = await bcrypt.compare(old_password, currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(new_password, salt);

    // Update the password in the database
    await sequelize.query(
      "UPDATE TF_users SET password = ? WHERE employee_no = ?",
      [hashedNewPassword, employee_no]
    );

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  createTFUser,
  addTFUserRole,
  getTFRoles,
  resetTFUserPassword
};
