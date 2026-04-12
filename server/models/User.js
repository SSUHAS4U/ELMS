import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  email:          { type: String, unique: true, required: true },
  username:       { type: String, unique: true, sparse: true },
  password:       String,                    // bcrypt hashed, null for Google users
  googleId:       String,                    // populated for Google OAuth users
  role:           { type: String, enum: ['admin', 'hr', 'employee'], required: true },
  department:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  employeeId:     String,                    // org-assigned ID
  designation:    String,                    // job title e.g. 'Senior Developer'
  avatar:         String,                    // URL
  phone:          String,
  dateOfBirth:    Date,                      // for birthday widget
  joiningDate:    Date,                      // work anniversary
  manager:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:       { type: Boolean, default: true },

  // OTP Auth
  otpCode:        String,
  otpExpires:     Date,
  otpAttempts:    { type: Number, default: 0 },

  // Leave Balances
  leaveBalance: {
    annual:       { type: Number, default: 18 },
    casual:       { type: Number, default: 12 },
    sick:         { type: Number, default: 10 },
    compensatory: { type: Number, default: 0 },
    carryForward: { type: Number, default: 0 },
  },

  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
