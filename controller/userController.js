const Users = require("../models/user-modal");
const bcrypt = require("bcryptjs");
const createUser = async (req, res) => {
  try {
    const {
      userName,
      mobile,
      email,
      password,
      role,
      createdOn,
      updatedOn,
      active,
    } = req.body;

    // Check if the user with the same email already exists
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Get the highest current userId in the database
    const latestUser = await Users.findOne().sort({ userId: -1 });
    let newUserId = 1000;

    if (latestUser) {
      newUserId = latestUser.userId + 1;
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new Users({
      userId: newUserId,
      userName,
      mobile,
      email,
      password: hashedPassword,
      role,
      passwordExpired: "No",
      emailVerified: "No",
      mobileNumberVerified: "No",
      provider: "Local",
      createdOn,
      updatedOn,
      active,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await Users.find();
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await Users.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params; // id is passed in req.params
  const { userName, mobile, email, role, updatedBy, updatedOn, active } =
    req.body;

  try {
    // Make sure to update the user using _id, not id
    const updatedData = await Users.findByIdAndUpdate(
      id, // This will use the _id field from MongoDB
      {
        userName,
        mobile,
        email,
        role,
        updatedBy: updatedBy || "super admin", // Default to "super admin" if not provided
        updatedOn,
        active,
      },
      { new: true } // Return the updated user object
    );

    if (!updatedData) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedData); // Return the updated user data
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await Users.findOneAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

const filterUsersByRole = async (req, res) => {
  const { role } = req.query; // Get the 'role' from query parameters

  try {
    // Check if 'role' parameter is provided in the query
    if (!role || role.length === 0) {
      return res.status(400).json({ message: "Role parameter is required" });
    }

    // If role is passed as multiple values, convert it into an array
    const rolesArray = Array.isArray(role) ? role : [role]; // Ensure it is an array

    // Use $in operator to filter users by any of the provided roles
    const filteredUsers = await Users.find({
      role: { $in: rolesArray }, // Use $in to match any of the roles
    });

    if (filteredUsers.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found for the specified roles" });
    }

    return res.status(200).json(filteredUsers); // Return filtered users
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};
const filterUsersByDetails = async (req, res) => {
  const { username, mobile, email } = req.query; // Get query parameters: username, mobile, email

  try {
    // Construct the filter object
    let filter = {};

    // Check if 'username' is provided and add to filter object
    if (username) {
      filter.userName = { $regex: new RegExp(username, "i") }; // Case-insensitive search
    }

    // Check if 'mobile' is provided and add to filter object
    if (mobile) {
      filter.mobile = mobile; // Exact match for mobile number
    }

    // Check if 'email' is provided and add to filter object
    if (email) {
      filter.email = { $regex: new RegExp(email, "i") }; // Case-insensitive search for email
    }

    // Fetch users from the database using the filter
    const filteredUsers = await Users.find(filter);

    // If no users match the filter, return 404 with an appropriate message
    if (filteredUsers.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found for the provided criteria" });
    }

    // Return the filtered users
    return res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error filtering users: ", error);
    return res
      .status(500)
      .json({ message: "Error filtering users", error: error.message });
  }
};

module.exports = {
  filterUsersByDetails,
  filterUsersByRole,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
