import mongoose from 'mongoose';
import dotenv from 'dotenv';
import minimist from 'minimist';

// Models
import User from '../models/User.js';
import Department from '../models/Department.js';
import LeaveRequest from '../models/LeaveRequest.js';
import SwipeRecord from '../models/SwipeRecord.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import LeaveType from '../models/LeaveType.js';
import Holiday from '../models/Holiday.js';
import OrganizationSetting from '../models/OrganizationSetting.js';

import bcrypt from 'bcryptjs';

dotenv.config({ path: '../.env' });

const argv = minimist(process.argv.slice(2));
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/elms';

const runReset = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // Delete all dynamic records
    console.log('Clearing old data...');
    await User.deleteMany({});
    await LeaveRequest.deleteMany({});
    await SwipeRecord.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await Department.deleteMany({});
    console.log('Old records deleted.');

    // Seed master super admin
    console.log('Seeding super admin...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const masterAdmin = await User.create({
      name: 'Super Admin',
      username: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      employeeId: 'ADMIN-001',
      designation: 'Master Administrator',
      isActive: true,
      leaveBalance: { annual: 20, casual: 12, sick: 10, compensatory: 0, carryForward: 0 }
    });
    console.log('Super Admin initialized:', masterAdmin.email, '(username: admin, password: admin123)');

    // Ensure Org Settings exist (we leave existing if any, or seed default)
    const orgCount = await OrganizationSetting.countDocuments();
    if (orgCount === 0) {
      console.log('Seeding default organization settings...');
      await OrganizationSetting.insertMany([
        { key: 'org.name', value: 'Google', label: 'Organization Name', group: 'company', type: 'string' },
        { key: 'org.timezone', value: 'America/Los_Angeles', label: 'Timezone', group: 'company', type: 'string' },
        { key: 'working.daysPerWeek', value: 5, label: 'Working Days', group: 'working_days', type: 'number' }
      ]);
    } else {
      console.log('Updating organization name to Google...');
      await OrganizationSetting.updateOne({ key: 'org.name' }, { $set: { value: 'Google' } });
    }

    console.log('Reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  }
};

runReset();
