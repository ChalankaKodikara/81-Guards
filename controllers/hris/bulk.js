const path = require("path");
const fs = require("fs");
const csvParser = require("csv-parser");
const { sequelize } = require("../../config/database");


const bulkUploadEmployees = async (req, res) => {
    let transaction;
  
    try {
      if (!req.file) {
        return res.status(400).json({ error: "CSV file is required" });
      }
  
      console.log("Uploaded File Details:", req.file);
  
      // Use req.file.path directly
      const filePath = req.file.path;
  
      // Check if the file actually exists before reading
      if (!fs.existsSync(filePath)) {
        return res.status(400).json({ error: "Uploaded file not found" });
      }
  
      const employees = [];
  
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          employees.push({
            employee_no: row.employee_no,
            name: row.name,
            nic: row.nic,
            date_of_birth: row.date_of_birth,
            contact_number: row.contact_number,
            address: row.address,
            employee_category: row.employee_category,
            employee_type: row.employee_type,
            department: row["Department "], // Check column names
            designation: row.designation,
            work_location: row.work_location,
            active_status: row.active_status ? 1 : 0,
          });
        })
        .on("end", async () => {
          try {
            transaction = await sequelize.transaction();
  
            for (const emp of employees) {
              const [existing] = await sequelize.query(
                "SELECT employee_no FROM employee WHERE employee_no = ?",
                { replacements: [emp.employee_no], transaction }
              );
  
              if (existing.length === 0) {
                await sequelize.query(
                  `INSERT INTO employee (
                    employee_no, name, nic, date_of_birth, contact_number, address,
                    employee_category, employee_type, department, designation,
                    work_location, active_status
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  {
                    replacements: [
                      emp.employee_no,
                      emp.name,
                      emp.nic,
                      emp.date_of_birth,
                      emp.contact_number,
                      emp.address,
                      emp.employee_category,
                      emp.employee_type,
                      emp.department,
                      emp.designation,
                      emp.work_location,
                      emp.active_status,
                    ],
                    transaction,
                  }
                );
              }
            }
  
            await transaction.commit();
            res.status(200).json({
              success: true,
              message: "Employees uploaded successfully",
            });
          } catch (error) {
            if (transaction) await transaction.rollback();
            console.error("Error processing CSV:", error);
            res.status(500).send("Internal Server Error");
          } finally {
            fs.unlinkSync(filePath); // Delete file after processing
          }
        });
    } catch (error) {
      console.error("Error in bulk upload:", error);
      res.status(500).send("Internal Server Error");
    }
  };
module.exports = { bulkUploadEmployees };
