module.exports = (req, res, next) => {
  if (req.userRole === "admin") {
    next();
  } else {
    const error = new Error("only admin can access this information");
    error.statusCode = 401;
    throw error;
  }
};
