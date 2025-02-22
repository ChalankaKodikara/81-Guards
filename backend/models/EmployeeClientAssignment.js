const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const EmployeeClientAssignment = sequelize.define(
  "EmployeeClientAssignment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    employee_no: {
      type: DataTypes.STRING, // Updated from INTEGER to STRING
      allowNull: false,
    },
  },
  {
    timestamps: true, 
  } 
);

module.exports = EmployeeClientAssignment;
