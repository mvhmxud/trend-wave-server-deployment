const User = require("../models/users");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
// register functionality "/auth/register" POST
exports.register = (req, res, next) => {
  const { name, email, password , address } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    throw error;
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        name: name,
        password: hashedPassword,
        email: email,
        address: address
      });
      return user.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "Regitered successfully 🥙 ",
        
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
        err.message = "Error while creating a user";
      }
      next(err);
    });
    
};

/// login functionality "/auth/login" POST
exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let userDoc;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    throw error;
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("there is no user with that email");
        error.statusCode = 404;
        throw error;
      }
      userDoc = user;
      // console.log(`password is ${user.password}`)
      // console.log(user);
      return bcrypt.compare(password, user.password);
    })
    .then((isValid) => {
      if (isValid) {
        res.status(200).json({
          token: jwt.sign(
            { id: userDoc._id, name: userDoc.name, email: userDoc.email , address : userDoc.address },
            process.env.JWT_SECRET,
            { expiresIn: "2days" }
          ),
        });
      } else {
        res.status(401).json({
          message: "invalid password ❌",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
        err.message = "Error while Logging a user";
      }
      next(err);
    });
};
