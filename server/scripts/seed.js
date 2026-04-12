import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Holiday from '../models/Holiday.js';

dotenv.config({ path: '../../.env' }); // Adjusted if run from scripts folder. Wait, .env is in ELMS root. So ../../.env from server/scripts -> d:\.env! That's wrong. Let's do resolve.
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') }); // ELMS root

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/elms');
    console.log('MongoDB Connected for Seeding...');

    // Clean out legacy Clerk indexes that prevent MongoDB native auth seeding
    const db = mongoose.connection.db;
    try { await db.collection('users').dropIndex('clerkUserId_1'); console.log('Dropped clerkUserId index'); } catch(e){}

    // Clear DB
    await User.deleteMany();
    await Department.deleteMany();
    await Holiday.deleteMany();

    // 1. Create Departments
    const dept1 = await Department.create({ name: 'Engineering' });
    const dept2 = await Department.create({ name: 'Human Resources' });
    const dept3 = await Department.create({ name: 'Operations' });

    console.log('Departments Generated.');

    // 2. Create Common Password
    const defaultPassword = await bcrypt.hash('Admin@123', 12);

    // 3. Create Users (Admin, HR, 2 Employees)
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@company.com',
      password: defaultPassword,
      role: 'admin',
      department: dept3._id,
      employeeId: 'ADM-001',
      isActive: true
    });

    const hr = await User.create({
      name: 'HR Manager',
      email: 'hr@company.com',
      password: defaultPassword,
      role: 'hr',
      department: dept2._id,
      employeeId: 'HR-001',
      createdBy: admin._id,
      isActive: true
    });

    const employee1 = await User.create({
      name: 'John Doe',
      email: 'employee1@company.com',
      password: defaultPassword,
      role: 'employee',
      department: dept1._id,
      employeeId: 'EMP-001',
      applyTo: hr._id,
      createdBy: admin._id,
      isActive: true
    });

    const employee2 = await User.create({
      name: 'Jane Smith',
      email: 'employee2@company.com',
      password: defaultPassword,
      role: 'employee',
      department: dept1._id,
      employeeId: 'EMP-002',
      applyTo: hr._id,
      createdBy: admin._id,
      isActive: true
    });

    console.log('Users Generated. Default pass: Admin@123');

    // 4. Create Holidays
    await Holiday.insertMany([
      { name: 'New Year', date: '2026-01-01', type: 'national' },
      { name: 'Christmas', date: '2026-12-25', type: 'national' }
    ]);

    console.log('Holidays Generated.');
    console.log('Seed Script Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDB();
