import mongoose from 'mongoose';
import dayjs from 'dayjs';

const masterFormSchema = new mongoose.Schema({
  masterName: { type: String, required: true},
  masterTraderId: { type: String, required: true , unique: true},
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
masterFormSchema.pre('save', function (next) {
  this.updatedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
  next();
});

export const MasterForm = mongoose.model('MasterForm', masterFormSchema);


// import mongoose from 'mongoose';
// import dayjs from 'dayjs';

// const formatDate = (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss");

// const masterFormSchema = new mongoose.Schema(
//   {
//     masterName: { type: String, required: true },
//     masterTraderId: { type: String, required: true },
//     createdBy: { type: String, enum: ["self", "admin"], default: "self" },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//       get: formatDate,
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//       get: formatDate,
//     },
//   },
//   {
//     toJSON: { getters: true }, // apply getters when converting to JSON
//     toObject: { getters: true }, // apply getters when converting to object
//   }
// );

// export const MasterForm = mongoose.model('MasterForm', masterFormSchema);
;

// import mongoose from 'mongoose';

// const masterFormSchema = new mongoose.Schema({
//   masterName : { type: String, required: true },
//   masterTraderId: { type: String, required: true },
//   createdBy: { type: String, enum: ["self", "admin"], default: "self" },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

// export const MasterForm = new mongoose.model('MasterForm', masterFormSchema);