import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  description:      String,
  parentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  headOf:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, {
  timestamps: true
});

export default mongoose.model('Department', departmentSchema);
