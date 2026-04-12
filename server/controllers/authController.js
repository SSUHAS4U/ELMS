import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
// We will integrate nodemailer transport here or from an email util
import { sendEmail } from '../utils/email.js';

const signToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res.cookie('elms_token', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  user.otpCode = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};

// @route POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const identifier = email;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide credentials' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    }).select('+password');

    if (!user || !user.isActive || !user.password) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password, or account deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password' });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/send-otp
export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: 'No active user found with that email address' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otpCode = hashedOtp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    user.otpAttempts = 0;
    await user.save();

    // Send email (HTML managed by Handlebars template engine later)
    await sendEmail({
      email: user.email,
      subject: 'Your ELMS Login OTP',
      template: 'otp',
      context: { otp }
    });

    res.status(200).json({ success: true, message: 'OTP sent to email!' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/verify-otp
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ email }).select('+otpCode +otpExpires +otpAttempts');

    if (!user || !user.isActive || !user.otpCode) {
      return res.status(400).json({ success: false, message: 'OTP is invalid or has expired' });
    }

    if (user.otpAttempts >= 3) {
      user.otpCode = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, user.otpCode);

    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(401).json({ success: false, message: 'Incorrect OTP' });
    }

    // Success
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('department');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/logout
export const logout = (req, res) => {
  res.cookie('elms_token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @route PUT /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // 1. Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // 2. Check current password
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // 3. Update password
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};
