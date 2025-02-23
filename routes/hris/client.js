// routes/branch.js
const express = require("express");
const { addClient } = require("../../controllers/hris/clients/add");
const { updateClient } = require("../../controllers/hris/clients/update");
const { deleteClient } = require("../../controllers/hris/clients/delete");
const {
  getClients,
  getClientsbyid,
} = require("../../controllers/hris/clients/get");
const {
  addEmployeeToClient,
  getEmployeesByClientId,
  updateEmployeeAssignment,
  deleteEmployeeAssignment,
  getUnassignedEmployees,
} = require("../../controllers/hris/clients/assignment/EmployeeClientAssignment"); // Adjust path as needed

const router = express.Router();

router.post("/add", addClient);
router.get("/get", getClients);
router.get("/getClientsbyid", getClientsbyid);

router.put("/update", updateClient);
router.delete("/delete/:id", deleteClient);

// Routes
router.post("/assignments", addEmployeeToClient); // Add an employee to a client
router.get("/assignments", getEmployeesByClientId); // Get employees by client ID
router.put("/assignments", updateEmployeeAssignment); // Update an assignment
router.delete("/assignments", deleteEmployeeAssignment); // Delete an assignment
router.get("/unassigned-employees", getUnassignedEmployees); //

module.exports = router;
