const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const isAdmin = require("../middlewares/isAdmin")
const userController = require("../controllers/User")
const router = express.Router();

router.get('/'  , isAdmin , userController.getAllUsers)

//update users info Name , email , address based on the authenticated user
router.put('/update' , userController.updateUser)



module.exports = router;
