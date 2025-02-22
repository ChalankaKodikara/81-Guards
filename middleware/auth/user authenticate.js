const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateUser = (req, res, next) => {
    const token = req.header("Authorization");
    const secret = process.env.secret_key;

    if (!token) {
        return res
            .status(401)
            .send({ message: "Unauthorized: No token provided" });
    }

    try {
        console.log(token);
        const decoded = jwt.verify(token, secret);
        decoded.user === "user";
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).send({ message: "Unauthorized: Invalid token" });
    }
};

module.exports = authenticateUser;
