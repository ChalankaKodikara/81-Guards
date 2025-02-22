const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Employee = sequelize.define(
  "Employee",
  {
    employee_no: {
      type: DataTypes.STRING(45),
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nic: {
      type: DataTypes.STRING(20),
      allowNull: true, // Some employees may not have an NIC
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    employee_category: {
      type: DataTypes.ENUM("Security", "Office"),
      allowNull: false,
    },
    employee_type: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    work_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    active_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

  },
  {
    tableName: "employee",
    timestamps: false,
  }
);

module.exports = Employee;
