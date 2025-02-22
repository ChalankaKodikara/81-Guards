const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const http = require("http");
const { sequelize } = require("./config/database");
const socketConfig = require("./config/socket"); // Socket.IO helper for initialization

// Import Routes
const EmployeeRoutes = require("./routes/hris/employee.js");
const Client = require("./routes/hris/client.js");
const Checkpoint = require("./routes/hris/checkpoints.js");
const User = require("./routes/hris/user.js");


// Import Models 
// require("./models/Employee");
// require("./models/Doctors.js");
// require("./models/Doctor_schedule.js");
// require("./models/Appointment.js");
// require("./models/Checkpoints.js");
// require("./models/Client.js");
// require("./models/EmployeeClientAssignment.js");
// require("./models/ScannedDetails.js");
//  require("./models/User");


const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketConfig.init(server); // Initialize Socket.IO with the HTTP server

const PORT = process.env.PORT || 8590;
  
// Middleware
app.use(express.json());
app.use(
  cors({ 
    origin: "*",
    credentials: true,
  })
);

// Sync all models with the database
// sequelize
//   .sync({ alter: true })
//   .then(() => console.log("All models synchronized successfully."))  
//   .catch((error) => console.error("Error syncing models:", error));
 
// Define Routes
app.use("/v1/81guards/employees", EmployeeRoutes);
app.use("/v1/81guards/client", Client);
app.use("/v1/81guards/checkpoints", Checkpoint);
app.use("/v1/hris/user", User);

  
// 404 Error Handling
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


