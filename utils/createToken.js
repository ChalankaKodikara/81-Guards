const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your_default_secret_key";
const REFRESH_SECRET_KEY =
  process.env.JWT_REFRESH_SECRET_KEY || "your_refresh_secret_key";

const generateAccessToken = (employee_no, permissions) => {
  return jwt.sign(
    { employee_no, permissions },
    SECRET_KEY,
    { expiresIn: "1h" } // Token expires in 1 hour
  );
};

const generateRefreshToken = (employee_no) => {
  return jwt.sign(
    { employee_no },
    REFRESH_SECRET_KEY,
    { expiresIn: "7d" } // Refresh token expires in 7 days
  );
};

module.exports = { 
  generateAccessToken,
  generateRefreshToken,
};
