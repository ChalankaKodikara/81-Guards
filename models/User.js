const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employee_no: {
      type: DataTypes.STRING(45),
      allowNull: true, // Allow null for non-employees
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    employee_status: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_role: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    user_type: {
      type: DataTypes.ENUM("admin", "superadmin", "user" , "client"), // Added 'user' for employees
      allowNull: false, // Must specify the type of user
    },
    employment: {
      type: DataTypes.ENUM("Yes", "No"), // Indicates if the user is an employee
      allowNull: false,
      defaultValue: "No", // Default to 'No' for non-employees
    },
  },
  {
    tableName: "user",
    timestamps: false,
  }
);

module.exports = User;
