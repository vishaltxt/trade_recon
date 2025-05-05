import mongoose from 'mongoose';
import dayjs from 'dayjs';

const minionFormSchema = new mongoose.Schema({
  minionName: { type: String, required: true },
  minionTraderId: { type: String, required: true ,unique: true},
  minionClientCode: { type: String, required: true},
  createdBy: { type: String, enum: ["self", "admin"], default: "self" },
  createdAt: {
    type: String,
    default: () => dayjs().format("YYYY-MM-DD HH:mm:ss"),
  },
  updatedAt: {
    type: String,
    default: () => dayjs().format("YYYY-MM-DD HH:mm:ss"),
  },
});

// Optional: Auto-update `updatedAt` before save
minionFormSchema.pre('save', function (next) {
  this.updatedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
  next();
});

export const MinionForm = mongoose.model('MinionForm', minionFormSchema);
