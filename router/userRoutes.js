const express = require("express");
const router = express.Router();
const userController = require("../controller/userController"); // Adjust the path based on your file structure

// Routes for user CRUD operations

router.get("/users/filter", userController.filterUsersByRole);
router.get("/users/filter/details", userController.filterUsersByDetails);

router.post("/users", userController.createUser); // Create user
router.get("/users", userController.getUsers); // Get all users
router.get("/users/:userId", userController.getUserById); // Get user by ID
router.put("/users/:id", userController.updateUser); // Update user details
router.delete("/users/:id", userController.deleteUser); // Delete user

module.exports = router;
