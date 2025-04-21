import {UserForm} from '../../models/userForm.js';

exports.createUser = async (req, res) => {
    try {
      const { firstName, lastName, email, role } = req.body;
      const newUser = new User({ firstName, lastName, email, role });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // Get all users
  exports.getUsers = async (req, res) => {
    try {
      const users = await UserForm.find();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // Update a user
  exports.updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await UserForm.findByIdAndUpdate(id, req.body, { new: true });
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // Delete a user
  exports.deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      await UserForm.findByIdAndDelete(id);
      res.json({ message: 'User deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };