import mongoose from 'mongoose';

/**
 * LeaveType — Dynamic leave type configuration.
 * All leave type options on the frontend must come from this collection.
 * Never hardcode 'casual', 'sick', 'annual', 'lop' in JSX.
 */
const leaveTypeSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true }, // e.g. 'Casual Leave'
  code:        { type: String, required: true, unique: true, lowercase: true }, // e.g. 'casual'
  description: String,
  color:       { type: String, default: '#008A4A' }, // hex for calendar colour-coding
  maxDaysPerYear: { type: Number, default: 12 },
  isHalfDayAllowed: { type: Boolean, default: true },
  isPaid:      { type: Boolean, default: true },
  genderRestriction: { 
    type: String, 
    enum: ['all', 'male', 'female'], 
    default: 'all' 
  },
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('LeaveType', leaveTypeSchema);
