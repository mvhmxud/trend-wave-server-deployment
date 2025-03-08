const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (req.get("Authorization")) {
    var token = req.get("Authorization").split(" ")[1];
  }
  if (!token) {
    const error = new Error("Token not found");
    error.statusCode = 401;
    throw error;
  }
  let decodedToken;
  try {
    decodedToken = jwt.decode(token, process.env.JWT_SECRET);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
 
  if (!decodedToken) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    throw error;
  }

  if (Date.now() >= decodedToken.exp * 1000) {
    const error = new Error("Token expired !");
    error.statusCode = 401;
    throw error;
  }
  req.userRole = decodedToken.role;
  req.userId = decodedToken.id;
  next();
};
