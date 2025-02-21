const { ensureToken } = require('../../controllers/hris/attendence/getattendence');


const ensureTokenMiddleware = async (req, res, next) => {
  try {
    await ensureToken();
    next();
  } catch (error) {
    console.error("Error ensuring token:", error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {ensureTokenMiddleware};
