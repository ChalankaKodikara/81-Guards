const { sequelize } = require("../../../config/database");
const bcrypt = require("bcryptjs");

const createUser = async (req, res) => {
  let transaction;

  try {
    const { employee_no, username, password, user_role, user_type, employment } = req.body;

    // Validate user_type
    const validUserTypes = ["admin", "superadmin", "user"];
    if (user_type && !validUserTypes.includes(user_type)) {
      return res.status(400).json({ error: "Invalid user type" });
    }

    // Validate employment
    const validEmploymentValues = ["Yes", "No"];
    if (!employment || !validEmploymentValues.includes(employment)) {
      return res.status(400).json({ error: "Invalid employment value" });
    }

    // Validate username and password
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Check if the username already exists
    const [existingUser] = await sequelize.query(
      "SELECT id FROM user WHERE username = ?",
      {
        replacements: [username],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Start a transaction
    transaction = await sequelize.transaction();

    // Validate role if provided
    if (user_role) {
      const [roleRows] = await sequelize.query(
        "SELECT id FROM roles WHERE id = ?",
        {
          replacements: [user_role],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (!roleRows) {
        await transaction.rollback();
        return res.status(400).json({ error: "Invalid role ID" });
      }
    }

    // If employee_no is provided and employment is "Yes", validate it
    if (employment === "Yes" && employee_no) {
      const [employee] = await sequelize.query(
        "SELECT employee_no FROM employee WHERE employee_no = ?",
        {
          replacements: [employee_no],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (!employee) {
        await transaction.rollback();
        return res.status(400).json({ error: "Invalid employee number" });
      }
    }

    // Insert user into the database
    await sequelize.query(
      `INSERT INTO user (employee_no, username, password, employee_status, user_role, user_type, employment) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          employment === "Yes" ? employee_no : null,
          username,
          hashedPassword,
          "ACTIVE",
          user_role || null,
          user_type || null,
          employment,
        ],
        type: sequelize.QueryTypes.INSERT,
        transaction,
      }
    );

    // Commit the transaction
    await transaction.commit();

    // Send success response
    return res.status(200).json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);

    // Rollback the transaction in case of an error
    if (transaction) await transaction.rollback();

    res.status(500).json({ error: "Internal Server Error" });
  }
};

const AddUserRole = async (req, res) => {
  try {
    const { role_name, role_description, permissions } = req.body;

    const transaction = await sequelize.transaction();

    // Check if all permission IDs exist in the permissions table
    const [permissionRows] = await sequelize.query(
      "SELECT id FROM permissions WHERE id IN (?)",
      {
        replacements: [permissions],
        type: sequelize.QueryTypes.SELECT,
        transaction
      }
    );

    const existingPermissionIds = permissionRows.map((row) => row.id);

    // Check if there are missing permission IDs
    const missingPermissionIds = permissions.filter(
      (id) => !existingPermissionIds.includes(id)
    );

    if (missingPermissionIds.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        error: "Some permission IDs do not exist",
        missingPermissionIds,
      });
    }

    // Insert role details into roles table
    const [roleResult] = await sequelize.query(
      "INSERT INTO roles (role_name, role_description) VALUES (?, ?)",
      {
        replacements: [role_name, role_description],
        type: sequelize.QueryTypes.INSERT,
        transaction
      }
    );

    const roleId = roleResult.insertId;

    // Insert permissions into role_permissions table
    for (const permissionId of permissions) {
      await sequelize.query(
        "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
        {
          replacements: [roleId, permissionId],
          type: sequelize.QueryTypes.INSERT,
          transaction
        }
      );
    }

    await transaction.commit();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Internal Server Error");
  }
};

const GetRoles = async (req, res) => {
  try {
    const [rows] = await sequelize.query("SELECT * FROM roles");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching roles data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Password reset functionality
const resetPassword = async (req, res) => {
  try {
    const { employee_no, old_password, new_password } = req.body;

    // Validate inputs
    if (!employee_no || !old_password || !new_password) {
      return res.status(400).json({
        error: "Employee number, old password, and new password are required",
      });
    }

    // Fetch the user's current password
    const [user] = await sequelize.query(
      "SELECT password FROM user WHERE employee_no = ?",
      {
        replacements: [employee_no],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!user) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const currentPassword = user.password;

    // Compare the old password with the current password
    const isMatch = await bcrypt.compare(old_password, currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    // Ensure the new password is different from the old password
    const isSamePassword = await bcrypt.compare(new_password, currentPassword);
    if (isSamePassword) {
      return res
        .status(400)
        .json({ error: "New password must be different from the old password" });
    }

    // Validate new password strength (example: at least 8 characters)
    if (new_password.length < 8) {
      return res
        .status(400)
        .json({ error: "New password must be at least 8 characters long" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(new_password, salt);

    // Update the password in the database
    await sequelize.query(
      "UPDATE user SET password = ? WHERE employee_no = ?",
      {
        replacements: [hashedNewPassword, employee_no],
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteUserRole = async (req, res) => {
  try {
    const { role_id } = req.query;

    if (!role_id) {
      return res.status(400).json({ error: "Role ID is required" });
    }

    const transaction = await sequelize.transaction();

    // Check if the role exists
    const [roleRows] = await sequelize.query(
      "SELECT id FROM roles WHERE id = ?",
      {
        replacements: [role_id],
        type: sequelize.QueryTypes.SELECT,
        transaction
      }
    );

    if (roleRows.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: "Role not found" });
    }

    // Delete associated permissions from role_permissions table
    await sequelize.query("DELETE FROM role_permissions WHERE role_id = ?", {
      replacements: [role_id],
      type: sequelize.QueryTypes.DELETE,
      transaction
    });

    // Delete the role from roles table
    await sequelize.query("DELETE FROM roles WHERE id = ?", {
      replacements: [role_id],
      type: sequelize.QueryTypes.DELETE,
      transaction
    });

    await transaction.commit();
    res
      .status(200)
      .json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.query; // Get ID from query parameters

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const transaction = await sequelize.transaction();

    // Delete the user from the database
    const [result] = await sequelize.query("DELETE FROM user WHERE id = ?", {
      replacements: [id],
      type: sequelize.QueryTypes.DELETE,
      transaction
    });

    if (result.affectedRows === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: "User not found" });
    }

    // Commit transaction
    await transaction.commit();

    // Send success response
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = {
  createUser,
  AddUserRole,
  GetRoles,
  resetPassword,
  deleteUserRole,
  deleteUser,
};
