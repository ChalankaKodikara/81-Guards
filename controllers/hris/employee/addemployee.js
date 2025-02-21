const { sequelize } = require("../../../config/database");

const addEmployee = async (req, res) => {
  try {
    const {
      employee_no,
      name,
      nic,
      date_of_birth,
      contact_number,
      address,
      employee_category, // Added employee category (Security or Office)
      employee_type,
      department,
      designation,
      work_location,
      active_status,
    } = req.body;

    if (!employee_no) {
      return res.status(400).json({ error: "Employee number is required" });
    }

    const query = `
      INSERT INTO employee 
      (employee_no, name, nic, date_of_birth, contact_number, address, employee_category, employee_type, department, designation, work_location, active_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await sequelize.query(query, {
      replacements: [
        employee_no,
        name,
        nic || null,
        date_of_birth,
        contact_number,
        address,
        employee_category, // Now required
        employee_type,
        department,
        designation,
        work_location,
        active_status !== undefined ? active_status : true,
      ],
    });

    return res.status(200).json({ message: "Employee added successfully" });
  } catch (error) {
    console.error("Error adding employee:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getEmployees = async (req, res) => {
  try {
    const query = `SELECT * FROM employee`;
    const [employees] = await sequelize.query(query);

    return res.status(200).json({ employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getEmployeeByNumber = async (req, res) => {
  try {
    const { employee_no } = req.query;

    if (!employee_no) {
      return res.status(400).json({ error: "Employee number is required" });
    }

    const query = `SELECT * FROM employee WHERE employee_no = ?`;
    const [employee] = await sequelize.query(query, {
      replacements: [employee_no],
    });

    if (employee.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.status(200).json({ employee: employee[0] });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { employee_no } = req.query;

    if (!employee_no) {
      return res.status(400).json({ error: "Employee number is required" });
    }

    const {
      name,
      nic,
      date_of_birth,
      contact_number,
      address,
      employee_category, // Now included in updates
      employee_type,
      department,
      designation,
      work_location,
      active_status,
    } = req.body;

    const query = `
      UPDATE employee
      SET 
        name = ?, 
        nic = ?, 
        date_of_birth = ?, 
        contact_number = ?, 
        address = ?, 
        employee_category = ?, 
        employee_type = ?, 
        department = ?, 
        designation = ?, 
        work_location = ?, 
        active_status = ?
      WHERE employee_no = ?`;

    const [result] = await sequelize.query(query, {
      replacements: [
        name,
        nic || null,
        date_of_birth,
        contact_number,
        address,
        employee_category,
        employee_type,
        department,
        designation,
        work_location,
        active_status !== undefined ? active_status : true,
        employee_no,
      ],
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addEmployee,
  getEmployees,
  getEmployeeByNumber,
  updateEmployee,
};
