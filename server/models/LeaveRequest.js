import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  employee:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType:      { type: String, enum: ['casual', 'compensatory', 'lop', 'paternity', 'maternity', 'sick', 'annual'], required: true },
  isHalfDay:      { type: Boolean, default: false },
  halfDayType:    { type: String, enum: ['first_half', 'second_half'] },
  startDate:      { type: Date, required: true },
  startTime:      { type: String },
  endDate:        { type: Date, required: true },
  endTime:        { type: String },
  numberOfDays:   { type: Number, required: true },
  reason:         { type: String, required: true, maxlength: 500 },
  applyTo:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // HR/Manager
  status:         { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalNote:   String,
  approvedAt:     Date
}, {
  timestamps: true
});

export default mongoose.model('LeaveRequest', leaveRequestSchema);
