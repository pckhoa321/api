const  registerUser  = require("../controllers/authControllers");
const authController = require("../controllers/authControllers");
const { route } = require("./user");

const router = require("express").Router();

//register
router.post("/register", authController.registerUser);

//login
router.post("/login", authController.loginUser);

module.exports = router;