const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Checkpoint = sequelize.define(
  "Checkpoint",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    employee_ids: {
      type: DataTypes.JSON, // Store employee IDs as a JSON array
      allowNull: false,
    },
    location_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    qr_code_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = Checkpoint;
