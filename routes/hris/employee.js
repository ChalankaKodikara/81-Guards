const express = require("express");
const {
  addEmployee,
  getEmployees,
  getEmployeeByNumber,
  updateEmployee,
} = require("../../controllers/hris/employee/addemployee");

const router = express.Router();

router.post("/add", addEmployee);
router.get("/get-all", getEmployees);
router.get("/employee", getEmployeeByNumber);
router.put("/employee", updateEmployee);

module.exports = router;
