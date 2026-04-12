import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type:        { type: String, enum: ['leave_submitted', 'leave_approved', 'leave_rejected', 'system'] },
  message:     String,
  relatedDoc:  mongoose.Schema.Types.ObjectId,
  isRead:      { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model('Notification', notificationSchema);
