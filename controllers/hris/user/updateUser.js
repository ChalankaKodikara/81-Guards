const { sequelize } = require("../../../config/database");
const bcrypt = require("bcryptjs");

const updateUser = async (req, res) => {
  let transaction;

  try {
    const { id } = req.query; // Get user ID from query parameters
    const {
      employee_no,
      username,
      password,
      employee_status,
      user_role,
      user_type,
      employment,
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Start transaction
    transaction = await sequelize.transaction();

    // Check if the username is already taken by another user
    if (username) {
      const existingUsers = await sequelize.query(
        "SELECT id FROM user WHERE username = ? AND id != ?",
        {
          replacements: [username, id],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (existingUsers.length > 0) {
        await transaction.rollback();
        return res.status(400).json({ error: "Username is already taken" });
      }
    }

    // Handle password hashing if provided and not already hashed
    let hashedPassword = password;
    if (password && !password.startsWith("$2a$")) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Validate user_role if provided
    if (user_role) {
      const roleExists = await sequelize.query(
        "SELECT id FROM roles WHERE id = ?",
        {
          replacements: [user_role],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (roleExists.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: "Invalid role ID" });
      }
    }

    // Validate employee_no if employment is "Yes"
    if (employment === "Yes" && employee_no) {
      const employeeExists = await sequelize.query(
        "SELECT employee_no FROM employee WHERE employee_no = ?",
        {
          replacements: [employee_no],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (employeeExists.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: "Invalid employee number" });
      }
    }

    // Build the update query dynamically
    const updateFields = [];
    const queryParams = [];

    if (employee_no !== undefined) {
      updateFields.push("employee_no = ?");
      queryParams.push(employee_no || null);
    }

    if (username !== undefined) {
      updateFields.push("username = ?");
      queryParams.push(username);
    }

    if (hashedPassword !== undefined) {
      updateFields.push("password = ?");
      queryParams.push(hashedPassword);
    }

    if (employee_status !== undefined) {
      updateFields.push("employee_status = ?");
      queryParams.push(employee_status);
    }

    if (user_role !== undefined) {
      updateFields.push("user_role = ?");
      queryParams.push(user_role || null);
    }

    if (user_type !== undefined) {
      updateFields.push("user_type = ?");
      queryParams.push(user_type);
    }

    if (employment !== undefined) {
      updateFields.push("employment = ?");
      queryParams.push(employment);
    }

    if (updateFields.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "No fields provided to update" });
    }

    const updateQuery = `UPDATE user SET ${updateFields.join(", ")} WHERE id = ?`;
    queryParams.push(id);

    // Execute the update query
    await sequelize.query(updateQuery, {
      replacements: queryParams,
      type: sequelize.QueryTypes.UPDATE,
      transaction,
    });

    // Commit the transaction
    await transaction.commit();

    // Send success response
    res.status(200).json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);

    // Rollback transaction in case of error
    if (transaction) {
      await transaction.rollback();
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateRolePermissions = async (req, res) => {
  let connection;
  try {
    const { id } = req.query; // role ID from the query parameter
    const { role_name, role_description, permissions } = req.body; // new role data from the request body

    if (!id || !role_name || !role_description || !permissions) {
      return res.status(400).json({ error: "All fields are required" });
    }

    connection = await sequelize.connectionManager.pool.getConnection();
    await connection.beginTransaction();

    // Update role name and description in the roles table
    await sequelize.query(
      "UPDATE roles SET role_name = ?, role_description = ? WHERE id = ?",
      [role_name, role_description, id]
    );

    // Fetch current permissions from role_permissions table
    const [currentPermissions] = await sequelize.query(
      "SELECT permission_id FROM role_permissions WHERE role_id = ?",
      [id]
    );

    const currentPermissionIds = currentPermissions.map(
      (row) => row.permission_id
    );

    // Determine permissions to add
    const permissionsToAdd = permissions.filter(
      (perm) => !currentPermissionIds.includes(perm)
    );

    // Determine permissions to remove
    const permissionsToRemove = currentPermissionIds.filter(
      (perm) => !permissions.includes(perm)
    );

    // Add new permissions to role_permissions
    for (const permId of permissionsToAdd) {
      await sequelize.query(
        "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
        [id, permId]
      );
    }

    // Remove unassigned permissions from role_permissions
    for (const permId of permissionsToRemove) {
      await sequelize.query(
        "DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?",
        [id, permId]
      );
    }

    await connection.commit();
    res
      .status(200)
      .json({ success: true, message: "Role updated successfully" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error updating role permissions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = { updateUser, updateRolePermissions };
