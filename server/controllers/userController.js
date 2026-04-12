import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

// @route POST /api/users/create (Admin Only)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, role, department, employeeId } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    // Use provided password or generate random 8-character password
    const tempPassword = req.body.password || crypto.randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Auto-generate username from name (e.g. John Doe -> johndoe)
    let baseUsername = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    let suffix = 1;
    while (await User.findOne({ username })) {
      username = `${baseUsername}${suffix}`;
      suffix++;
    }

    const userData = {
      name,
      email,
      username,
      role,
      password: hashedPassword,
      employeeId,
      createdBy: req.user._id
    };
    
    // Only include department if provided and non-empty
    if (department) userData.department = department;

    const newUser = await User.create(userData);

    // Send Welcome Email (non-blocking)
    sendEmail({
      email: newUser.email,
      subject: 'Welcome to ELMS - Your Credentials',
      template: 'welcome',
      context: {
        name: newUser.name,
        email: newUser.email,
        password: tempPassword,
        role: newUser.role
      }
    }).catch(err => console.error('Welcome email failed:', err.message));

    newUser.password = undefined;
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    // Handle duplicate key errors nicely
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A user with this email or employee ID already exists.' });
    }
    next(error);
  }
};

// @route GET /api/users (Admin/HR Only)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, active } = req.query;
    let query = {};
    if (role) query.role = role;
    if (active) query.isActive = active === 'true';

    const users = await User.find(query).populate('department', 'name').select('-password').sort('name');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/users/managers (Everyone) -> To find someone to apply leave to
export const getManagers = async (req, res, next) => {
  try {
    const managers = await User.find({ role: { $in: ['hr', 'admin'] }, isActive: true })
      .select('name _id role email');
    res.status(200).json({ success: true, managers });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/users/:id (Admin Only) -> Soft Delete
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot deactivate admin accounts' });

    user.isActive = false;
    await user.save();

    res.status(200).json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/users/:id/reactivate (Admin Only)
export const reactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = true;
    await user.save();

    res.status(200).json({ success: true, message: 'User reactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/users/:id (Admin Only)
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, employeeId, department } = req.body;
    
    // Check if another user has the same email
    const existing = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Another user with this email already exists.' });
    }

    const updateData = { name, email, role, employeeId };
    if (department) updateData.department = department;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A user with this employee ID already exists.' });
    }
    next(error);
  }
};
