// import { UserForm } from "../../modals/formModels/userForm-model.js";
import { User } from "../../modals/userModels/user-model.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password, role } = req.body;
    if (req.user.role !== "admin" && role === "admin") {
      return res.status(403).json({ msg: "Only admins can create admin users" });
    }
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ msg: "Email already exists" });
    }
    // const saltRound = await bcrypt.genSalt(10);
    // const hash_password = await bcrypt.hash(password, saltRound);
    // password = hash_password;
    const userCreated = await User.create({
      firstname,
      lastname,
      email,
      password,
      role: role || "reader",
      createdBy: "admin",
    });
    res.status(201).json({ msg: "User created successfully", userId: userCreated._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, ...updates } = req.body;

    if (password) {
      const saltRound = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, saltRound);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
