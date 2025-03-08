const express = require("express");
const User = require("../models/users");

const router = express.Router();
const authController = require("../controllers/Auth.js");
const { body } = require("express-validator");

router.post(
  "/register",
  [
    body("name").notEmpty().isLength({ max: "50" }),
    body("password").notEmpty().isLength({ min: 6 }),
    body("address").notEmpty(),
    body("email")
      .custom((val) => {
        return User.findOne({ email: val }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("email address already exists");
          }
        });
      })
      .withMessage("Email already in use !")
      .isEmail()
      .notEmpty()
      .normalizeEmail(),
  ],
  authController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().notEmpty().normalizeEmail(),
    body("password").notEmpty().isLength({ min: 6 }),
  ],
  authController.login
);

module.exports = router;
