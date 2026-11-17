# FitZone – Gym Management System

FitZone is a web-based Gym Management System developed to simplify and manage daily gym operations. It provides separate interfaces for administrators and members to manage gym activities efficiently.

## Live Demo

- **Frontend:** https://fit-zone-frontend-omega.vercel.app
- **Backend API:** https://fit-zone-backend-plum.vercel.app

## Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Redux Toolkit
- React Redux
- React Router
- Axios
- Tailwind CSS
- Recharts
- Lucide React

### Testing
- Playwright

## Main Features

### Admin Features
- Secure Admin Login
- Forgot Password and Password Reset
- Admin Dashboard
- Member Management
- Trainer Management
- Workout Plan Management
- Membership Plan Management
- Attendance Management
- Subscription Management
- Payment Management
- Analytics Dashboard
- System Settings

### Member Features
- Member Dashboard
- View Workout Plans
- View Subscription Details
- View Attendance Records
- View Payment History
- Track Personal Progress

## Project Structure

```text
src/
├── assets/
├── components/
│   └── dashboard/
├── pages/
├── routes/
├── services/
├── store/
└── types/
```

## Prerequisites

Make sure the following software is installed:

- Node.js
- npm
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/thushan475/FitZone-Frontend.git
```

### 2. Navigate to the Project

```bash
cd FitZone-Frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root directory.

```env
VITE_API_URL=https://fit-zone-backend-plum.vercel.app/api
```

For local backend development, use:

```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start the Development Server

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build the production application |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Playwright tests |

## Production Build

To create a production build:

```bash
npm run build
```

The generated production files will be available in the `dist/` directory.

## Automated Testing

FitZone uses Playwright for frontend testing.

Run the tests using:

```bash
npm test
```

The test suite includes desktop and mobile browser tests for login page loading, forgot password navigation, protected routes, and admin login.

## Backend Repository

[FitZone Backend – GitHub](https://github.com/thushan475/FitZone-Backend)

## Deployment

The frontend is deployed using Vercel and communicates with the FitZone backend API.

**Frontend URL:** https://fit-zone-frontend-omega.vercel.app

**Backend URL:** https://fit-zone-backend-plum.vercel.app

---

Developed as an academic project for the Rapid Application Development (RAD) module.
