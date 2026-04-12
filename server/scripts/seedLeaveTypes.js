/**
 * Seed script: populate LeaveType collection with defaults
 * Run: node scripts/seedLeaveTypes.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import model
const leaveTypeSchema = new mongoose.Schema({
  name: String, code: { type: String, lowercase: true }, description: String,
  color: String, maxDaysPerYear: Number, isHalfDayAllowed: Boolean,
  isPaid: Boolean, genderRestriction: String, isActive: Boolean, sortOrder: Number
}, { timestamps: true });

const LeaveType = mongoose.models.LeaveType || mongoose.model('LeaveType', leaveTypeSchema);

const DEFAULT_LEAVE_TYPES = [
  { name: 'Casual Leave',         code: 'casual',      color: '#008A4A', maxDaysPerYear: 12, isHalfDayAllowed: true,  isPaid: true,  genderRestriction: 'all',    sortOrder: 1 },
  { name: 'Sick Leave',           code: 'sick',        color: '#FF4466', maxDaysPerYear: 10, isHalfDayAllowed: true,  isPaid: true,  genderRestriction: 'all',    sortOrder: 2 },
  { name: 'Annual Leave',         code: 'annual',      color: '#7B61FF', maxDaysPerYear: 18, isHalfDayAllowed: false, isPaid: true,  genderRestriction: 'all',    sortOrder: 3 },
  { name: 'Loss of Pay',          code: 'lop',         color: '#FFAA00', maxDaysPerYear: 0,  isHalfDayAllowed: true,  isPaid: false, genderRestriction: 'all',    sortOrder: 4 },
  { name: 'Compensatory Leave',   code: 'compensatory',color: '#00C9FF', maxDaysPerYear: 0,  isHalfDayAllowed: true,  isPaid: true,  genderRestriction: 'all',    sortOrder: 5 },
  { name: 'Maternity Leave',      code: 'maternity',   color: '#FF69B4', maxDaysPerYear: 90, isHalfDayAllowed: false, isPaid: true,  genderRestriction: 'female', sortOrder: 6 },
  { name: 'Paternity Leave',      code: 'paternity',   color: '#4FC3F7', maxDaysPerYear: 5,  isHalfDayAllowed: false, isPaid: true,  genderRestriction: 'male',   sortOrder: 7 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await LeaveType.countDocuments();
    if (existing > 0) {
      console.log(`${existing} leave types already exist. Skipping seed.`);
    } else {
      await LeaveType.insertMany(DEFAULT_LEAVE_TYPES.map(lt => ({ ...lt, isActive: true })));
      console.log(`✅ Seeded ${DEFAULT_LEAVE_TYPES.length} leave types`);
    }
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
