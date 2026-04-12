import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check cookies for token
    if (req.cookies && req.cookies.elms_token) {
      token = req.cookies.elms_token;
    } 
    // Fallback to Bearer token in headers (for API testing if needed)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'You are not logged in. Please log in to get access.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'The user belonging to this token does no longer exist.' });
    }

    // Check if user is active
    if (!currentUser.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated.' });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token or session expired. Please log in again.' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
    }
    next();
  };
};

export { protect, restrictTo };
