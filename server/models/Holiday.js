import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema({
  name:     { type: String, required: true },
  date:     { type: Date, required: true },
  type:     { type: String, enum: ['national', 'regional', 'optional'] },
  year:     Number
}, {
  timestamps: true
});

// Auto-populate year based on date before saving
holidaySchema.pre('save', function(next) {
  if (this.date) {
    this.year = this.date.getFullYear();
  }
  next();
});

export default mongoose.model('Holiday', holidaySchema);
