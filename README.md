# Obsidian ELMS - Employee Leave Management System

### 🚀 [Access the Live Application](https://obsidianelms.netlify.app/)

## Overview
Obsidian ELMS is a modern, full-stack Employee Leave Management System (ELMS) designed to streamline leave requests, HR approvals, and employee tracking functionality within organizations. 

## System Architecture

The application is built using the **MERN** stack (MongoDB, Express, React, Node.js) structured as a monorepo containing both the `client` and `server` applications.

### 1. Frontend (Client)
- **Framework:** React 18, Vite.
- **Styling:** TailwindCSS, Vanilla CSS (`index.css` for customized theming), leveraging dark-mode rich aesthetics and glassmorphism.
- **Routing:** React Router v6 for Protected and Public routes.
- **State Management:** Zustand (`useAuthStore`, `useThemeStore`).
- **Real-time Engine:** Custom WebSockets hook (`useSocket`).

### 2. Backend (Server)
- **Framework:** Node.js, Express.
- **Database:** MongoDB (using Mongoose schemas).
- **Authentication:** JWT (JSON Web Tokens) with OTP-based verification or email-based links.
- **Key Modules:**
  - `User`, `Department`, `LeaveRequest`, `LeaveType`, `Holiday`, `SwipeRecord`, `AuditLog`, `Notification`
- **Email Service:** Powered by **Resend API** for high-reliability OTP delivery and leave notifications via Handlebars (.hbs) email templates.

### 3. Key Workflows
1. **Authentication:** Users log in. RBAC ensures access separates between `Employee`, `HR`, and `Admin`.
2. **Leave Application:** Handled via modal components (using React Portals to prevent z-index UI glitches).
3. **Approval Flow:** An employee request notifies managers. Dynamic status updates push via WebSockets and emit email templates (`leave-submitted`, `leave-approved`, `leave-rejected`).
4. **Dashboards:** Data points visualised leveraging dynamic Recharts.

## Folder Structure

```
d:\ELMS/
├── client/                     # React Frontend application
│   ├── src/                    # Source code
│   │   ├── components/         # Reusable UI (admin, hr, employee, layout, leaves, 3d, motion)
│   │   ├── pages/              # Route level components
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── lib/                # API configurations & utilities
│   │   └── ...
│   ├── public/                 # Static assets
│   └── package.json            # Client Dependencies
├── server/                     # Node.js backend application
│   ├── config/                 # Database configurations
│   ├── controllers/            # Route logic
│   ├── email-templates/        # Handlebars templates
│   ├── middleware/             # Auth + Error handling logic
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express API endpoints
│   ├── scripts/                # Database seeding & reset scripts
│   ├── utils/                  # Helper functions
│   └── server.js               # Entry point
└── package.json                # Root Monorepo configuration
```

## Running the Application 

To run the full stack architecture locally, from the root directory run:
```bash
npm install
npm run dev
```
This leverages `concurrently` to spawn both the Vite frontend and Express debug server at the same time.

## Note on Dependencies
The `package.json` file is strictly required for this project to fetch its necessary `node_modules`. Do not untrack or delete it from the repository.
