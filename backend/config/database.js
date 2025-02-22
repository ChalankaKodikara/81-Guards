// config/database.js
const { Sequelize, Op } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME, // Your database name
  process.env.DB_USER, // Your database user
  process.env.DB_PASSWORD, // Your database password
  {
    host: process.env.DB_HOST, // Your database host
    port: process.env.DB_PORT, // Your database port (3306 by default)
    dialect: "mysql", // Database dialect
    dialectOptions: {
      connectTimeout: 60000, // Optional: connection timeout
    },
    pool: {
      max: 100,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
    logging: true,
  }
);

// Test the connection
sequelize
  .authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.error("Unable to connect to the database:", error));

module.exports = { sequelize, Op }; // Export sequelize instance
