const bcrypt = require("bcryptjs");
const { sequelize } = require("../../../config/database");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../utils/createToken");

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const { os, browser, mac } = req.query;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Query the user table for the given username or employee_no
    const userQuery = username.startsWith("EMP")
      ? `SELECT * FROM user WHERE employee_no = ?`
      : `SELECT * FROM user WHERE username = ?`;

    const [existingUser] = await sequelize.query(userQuery, {
      replacements: [username],
      type: sequelize.QueryTypes.SELECT,
    });

    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "User not found or invalid username" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    const loginStatus = isPasswordValid ? "Pass" : "Fail";

    // Log login attempt
    await sequelize.query(
      `INSERT INTO login_logs (username, login_status, OS, browser, mac, logged_time) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          existingUser.username,
          loginStatus,
          os || null,
          browser || null,
          mac || null,
          new Date(),
        ],
        type: sequelize.QueryTypes.INSERT,
      }
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Initialize variables for response
    let employeeDetails = null;
    let designationDepartmentDetails = null;
    let attendanceResponse = {
      checkIN_time: null,
      checkIN_type: null,
      checkOUT_time: null,
      checkOUT_type: null,
      attendanceStatus: null,
    };
    let supervisorId = null;

    if (existingUser.employment === "Yes") {
      // Employee-specific logic
      const [employeeData] = await sequelize.query(
        `SELECT employee_active_status 
         FROM employee 
         WHERE employee_no = ?`,
        {
          replacements: [existingUser.employee_no],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (
        !employeeData ||
        (employeeData.employee_active_status !== "ACTIVE" &&
          employeeData.employee_active_status !== "Active")
      ) {
        return res.status(403).json({ message: "User is not active" });
      }

      const [fetchedEmployeeDetails] = await sequelize.query(
        `SELECT employee_fullname, employee_name_initial, employee_calling_name 
         FROM employee 
         WHERE employee_no = ?`,
        {
          replacements: [existingUser.employee_no],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      employeeDetails = fetchedEmployeeDetails || null;

      const [fetchedDesignationDepartmentDetails] = await sequelize.query(
        `SELECT dd.designation, dd.department 
         FROM employee e 
         JOIN designation_department dd ON e.department_designation_id = dd.id 
         WHERE e.employee_no = ?`,
        {
          replacements: [existingUser.employee_no],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      designationDepartmentDetails =
        fetchedDesignationDepartmentDetails || null;

      const [attendanceDetails] = await sequelize.query(
        `SELECT checkIN_time, checkIN_type, checkOUT_time, checkOUT_type, status AS attendanceStatus 
         FROM attendance_daily_for_employee 
         WHERE employee_id = ? 
           AND DATE(checkIN_time) = CURDATE() 
         LIMIT 1`,
        {
          replacements: [existingUser.employee_no],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      attendanceResponse = attendanceDetails || attendanceResponse;

      const [supervisorData] = await sequelize.query(
        `SELECT s.id AS supervisor_id, s.supervisor_employee_no, s.supervisor_fullname, s.supervisor_email, s.supervisor_contact_no 
         FROM supervisor_employee_assignment sea
         JOIN supervisor s ON sea.supervisor_id = s.id
         WHERE s.supervisor_employee_no = ?`,
        {
          replacements: [existingUser.employee_no],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      supervisorId = supervisorData?.supervisor_id || null;
    }

    // Fetch the first row from the currencies table
    const [currencyData] = await sequelize.query(
      `SELECT currency, symbol FROM currencies LIMIT 1`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const currency = currencyData?.currency || "USD";
    const symbol = currencyData?.symbol || "$";

    const permissions = await sequelize.query(
      `SELECT p.id 
       FROM permissions p 
       JOIN role_permissions rp ON p.id = rp.permission_id 
       JOIN roles r ON rp.role_id = r.id 
       WHERE r.id = ?`,
      {
        replacements: [existingUser.user_role],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const permissionIds = permissions.map((p) => p.id);

    const accessToken = generateAccessToken(
      existingUser.employee_no || existingUser.username,
      permissionIds
    );
    const refreshToken = generateRefreshToken(
      existingUser.employee_no || existingUser.username
    );

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await sequelize.query(
      `INSERT INTO refresh_tokens (employee_no, token, expires_at) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE token = ?, expires_at = ?`,
      {
        replacements: [
          existingUser.employee_no || existingUser.username,
          refreshToken,
          expiresAt,
          refreshToken,
          expiresAt,
        ],
        type: sequelize.QueryTypes.INSERT,
      }
    );

    // Construct response
    const response = {
      employee_no: existingUser.employee_no || null,
      username: existingUser.username,
      user_type: existingUser.user_type || "N/A",
      user_token: accessToken,
      permissions: permissionIds,
      supervisorId: supervisorId,
      currency: currency,
      symbol: symbol,
    };

    if (existingUser.employment === "Yes") {
      // Include employee-specific data for employment = 'Yes'
      Object.assign(response, {
        employee_fullname: employeeDetails?.employee_fullname || null,
        employee_name_initial: employeeDetails?.employee_name_initial || null,
        employee_calling_name: employeeDetails?.employee_calling_name || null,
        designation: designationDepartmentDetails?.designation || null,
        department: designationDepartmentDetails?.department || null,
        checkIN_time: attendanceResponse.checkIN_time,
        checkIN_type: attendanceResponse.checkIN_type,
        checkOUT_time: attendanceResponse.checkOUT_time,
        checkOUT_type: attendanceResponse.checkOUT_type,
        attendanceStatus: attendanceResponse.attendanceStatus,
      });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error executing login query:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { loginUser };
