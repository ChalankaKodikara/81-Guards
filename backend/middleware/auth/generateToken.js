const jwt = require("jsonwebtoken");

const generateAccessToken = (userId, permissions) => {
  return jwt.sign(
    { userId, permissions },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Short-lived access token
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" } // Longer-lived refresh token
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
