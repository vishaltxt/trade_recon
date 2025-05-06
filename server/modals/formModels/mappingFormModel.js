import mongoose from 'mongoose';
import dayjs from 'dayjs';

const mappingFormSchema = new mongoose.Schema({
  masterId: { type: String, required: true },
  minionId: { type: String, required: true },
  replicationPercentage: { type: Number, required: true },
  toggle :{ type: Boolean, default: false },
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
mappingFormSchema.pre('save', function (next) {
  this.updatedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
  next();
});


mappingFormSchema.pre('save', function (next) {
  if (!this.createdAt) {
    this.createdAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
  }
  next();
});

export const MappingForm = mongoose.model('MappingForm', mappingFormSchema);


// MappingForm.syncIndexes()
//   .then(() => console.log("Indexes synced"))
  // .catch((err) => console.error("Index sync failed:", err));
