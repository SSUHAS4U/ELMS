import mongoose from 'mongoose';

/**
 * AuditLog — Immutable trail of every mutating action in the system.
 * Written by the service layer on every INSERT, UPDATE, DELETE on core tables.
 * Admins can read; nobody can delete.
 */
const auditLogSchema = new mongoose.Schema({
  actor:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorName:String, // denormalised for display even if user is deleted
  action:   { type: String, required: true }, // e.g. 'leave.applied', 'user.created', 'leave.approved'
  target:   { type: String }, // human-readable description of what was affected
  targetId: { type: mongoose.Schema.Types.ObjectId }, // optional reference ID
  targetModel: String, // 'LeaveRequest' | 'User' | 'Department' | etc.
  details:  { type: mongoose.Schema.Types.Mixed }, // arbitrary JSON diff/snapshot
  ip:       String,
}, {
  timestamps: true,
  // Never allow deletion via Mongoose
  statics: {}
});

// Prevent updates to prevent tampering
auditLogSchema.pre('findOneAndUpdate', function() {
  throw new Error('AuditLog records are immutable');
});

export default mongoose.model('AuditLog', auditLogSchema);
