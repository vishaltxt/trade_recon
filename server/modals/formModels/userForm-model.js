import mongoose from 'mongoose';

const userFormSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  role: { type: String, required: true },
});

export const UserForm = new mongoose.model('UserForm', userFormSchema);