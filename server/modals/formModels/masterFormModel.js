import mongoose from 'mongoose';

const masterFormSchema = new mongoose.Schema({
  masterName : { type: String, required: true },
  masterTraderId: { type: String, required: true },
});

export const MasterForm = new mongoose.model('MasterForm', masterFormSchema);