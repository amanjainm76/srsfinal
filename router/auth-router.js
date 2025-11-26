const express = require("express");
const authcontrollers = require("../controller/auth-controller");
const router = express.Router();
const validate = require("../middleware/validate-midleware");
const signupSchema = require("../validators/auth-validators");
// Define the POST route for registration (not GET)
router
  .route("/register")
  .post(validate(signupSchema), authcontrollers.register);
router.route("/login").post(authcontrollers.login);

module.exports = router;
