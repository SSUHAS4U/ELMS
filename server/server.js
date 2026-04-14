import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';

// Register all Mongoose models (needed for .populate() to work)
import './models/User.js';
import './models/Department.js';
import './models/LeaveRequest.js';
import './models/LeaveType.js';
import './models/Holiday.js';
import './models/SwipeRecord.js';
import './models/Notification.js';
import './models/AuditLog.js';
import './models/OrganizationSetting.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import leaveTypeRoutes from './routes/leaveTypeRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import swipeRoutes from './routes/swipeRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import orgSettingsRoutes from './routes/orgSettingsRoutes.js';

// Load env vars from root directory
dotenv.config(); 

const app = express();
app.set('trust proxy', true); // Essential for Render/Load Balancers to properly detect https protocol
const server = http.createServer(app);

// CORS configuration - allow multiple origins
const envOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(url => url.trim()) : [];
const allowedOrigins = [
  'http://localhost:5173',
  'https://obsidianelms.netlify.app',
  ...envOrigins
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Check if origin is in allowed list or matches a pattern
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Configure Socket.io
const io = new Server(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser()); // Initialize cookie parser for HttpOnly JWT reading

// Inject io into every request
app.use((req, res, next) => { 
  req.io = io; 
  next(); 
});

// Global API rate limiting
app.use('/api/', apiLimiter);

// Mount native Express Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-log', auditLogRoutes);
app.use('/api/org', orgSettingsRoutes);

// Socket logic
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => server.listen(PORT, () => console.log(`Server & Socket.io native running on port ${PORT}`)))
  .catch(err => console.error('MongoDB boot config err:', err));
