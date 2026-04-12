import mongoose from 'mongoose';

/**
 * OrganizationSetting — System-wide configuration.
 * Stored as key-value pairs so new settings can be added without schema changes.
 * Frontend reads all on load and pre-populates the Organization Settings form.
 */
const orgSettingSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  label: String,      // Human-readable label for the UI form
  group: String,      // Logical grouping: 'company' | 'leave_policy' | 'working_days'
  type:  { 
    type: String, 
    enum: ['string', 'number', 'boolean', 'json'], 
    default: 'string' 
  },
}, { timestamps: true });

export default mongoose.model('OrganizationSetting', orgSettingSchema);
