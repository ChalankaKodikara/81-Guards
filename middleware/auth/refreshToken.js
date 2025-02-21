const refreshTokenHandler = async (req, res) => {
  const { refresh_token } = req.body;
  const currentTime = new Date();

  // Query the database for the refresh token
  const [tokenData] = await sequelize.query(
    `SELECT * FROM refresh_tokens WHERE token = ?`,
    [refresh_token]
  );

  if (!tokenData.length) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const { expires_at } = tokenData[0];

  if (new Date(expires_at) < currentTime) {
    return res
      .status(401)
      .json({ message: "Refresh token expired, please log in again" });
  }

  // Generate a new access token if the refresh token is valid
  const newAccessToken = generateAccessToken(tokenData[0].employee_no);
  res.json({ access_token: newAccessToken });
};
