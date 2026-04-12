import mongoose from 'mongoose';

const swipeRecordSchema = new mongoose.Schema({
  employee:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:           { type: Date, required: true },
  inTime:         Date,
  outTime:        Date,
  workDuration:   Number,    // minutes
  breakDuration:  Number,    // minutes
  regularizeHours: Number,
  status:         { type: String, enum: ['present', 'wfh', 'lop', 'xr', 'co', 'half_day'] },
  regularizeRequest: {
    requested:    Boolean,
    reason:       String,
    approvedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
}, {
  timestamps: true
});

export default mongoose.model('SwipeRecord', swipeRecordSchema);
