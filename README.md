# TaskFlow — Smart Task & Real-Time Time Tracking Platform

A production-grade, full-stack productivity web application built for the **Suntek AI Assessment**. TaskFlow combines granular task management, live persistent time tracking, visual analytics, and Google Gemini AI natural-language task parsing into a unified, responsive user experience.

---

## 🔗 Live Deployments & Repository

| Service | Link | Notes |
| :--- | :--- | :--- |
| 🚀 **Web App (Frontend)** | [task-flow-suntek-ai.vercel.app](https://task-flow-suntek-ai.vercel.app) | Deployed on **Vercel** |
| ⚙️ **REST API (Backend)** | [taskflow-suntek-ai-assesment.onrender.com](https://taskflow-suntek-ai-assesment.onrender.com) | Deployed on **Render** |
| 📦 **GitHub Repository** | [github.com/AmolSonawane1026/TaskFlow-Suntek-AI-Assesment](https://github.com/AmolSonawane1026/TaskFlow-Suntek-AI-Assesment.git) | Monorepo structure |

---

## 💡 Why TaskFlow?

Most task trackers treat time tracking as an afterthought or force users to switch between disconnected tabs. TaskFlow was designed to bridge that gap with:

1. **Floating Liquid-Glass Timer**: A persistent, route-independent active timer widget that stays anchored directly below the navigation bar. You can jump between Dashboard, Tasks, and Time Logs without losing track of your running stopwatch.
2. **AI-Powered Natural Language Task Creation**: Powered by Google Gemini 2.5 Flash. Instead of filling out five form fields, just type `"Fix checkout bug on mobile by tomorrow high priority 2h"` and the AI automatically parses title, description, priority, category tags, and estimated duration.
3. **Instant Real-Time State Sync**: When you start or stop a timer or update a task status, Redux Thunks immediately synchronize your daily hours tracked, task counts, and summary metrics across all views without requiring a page refresh.
4. **Actionable Visual Analytics**: Visual daily and weekly breakdowns rendered with Chart.js, plus personalized AI productivity summaries analyzing your work habits.

---

## ✨ Features Breakdown

### 📋 Task Management
- **Full CRUD operations**: Create, read, update, and delete tasks with real-time feedback.
- **Kanban-Style Statuses**: Toggle between `Todo`, `In Progress`, and `Completed` in one click with smooth state transitions.
- **Priority Matrix**: `Low`, `Medium`, `High`, and `Urgent` visual badges with tailored color accents.
- **Tags & Due Dates**: Categorize tasks by domains (e.g. `#frontend`, `#api`, `#urgent`) with automated overdue warnings.
- **Interactive Modals**:
  - Detailed task inspection popup displaying all metadata, timestamps, and logged time.
  - Dedicated edit modal with Formik + Yup field validation.
  - SweetAlert2 confirmations to prevent accidental deletions.

### ⏱️ Real-Time Time Tracking
- **One-Click Stopwatch**: Start and stop timers directly on any task card or from the active tracker.
- **Independent Floating Pill**: Centered below the navbar with a frosted glass eye-drop droplet aesthetic (`bg-gray-950/80 backdrop-blur-2xl`), live pulsing emerald status indicator, monospace stopwatch ticker, and an instant stop button.
- **Non-blocking Global Life Cycle**: Root-level mounting ensures the timer keeps ticking even during client-side route transitions without unmounting or resetting elapsed seconds.
- **Comprehensive Audit Logs**: Dedicated **Time Logs** table showing exact start times, end times, duration formatting (`hh:mm:ss`), and associated task references.

### 🤖 Google Gemini AI Integration
- **Smart Task Prompting**: Converts casual sentences into structured task schemas.
- **Multi-Model Fallback Engine**: Resilient backend pipeline trying `gemini-2.5-flash`, `gemini-flash-latest`, and `gemini-2.5-pro` with local rule-based fallback if offline.
- **AI Productivity Summary**: Evaluates completed tasks and logged intervals to give actionable advice on workload distribution and time efficiency.

### 📊 Productivity Dashboard
- **Top Metrics**: Total Tasks, Completed Tasks, Time Tracked Today, and Tasks Worked On.
- **Interactive Chart.js Visuals**: Daily tracked hours bar charts and weekly productivity trend curves.
- **Quick Natural Language Creator**: Integrated directly into the Dashboard hero section for effortless task capture.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16.3.6 (App Router, Standalone build)
- **Library**: React 19.2.8
- **State Management**: Redux Toolkit (`@reduxjs/toolkit` 2.x) + React-Redux
- **Styling**: Tailwind CSS v4 with custom crimson/orange design tokens
- **Data Visualization**: Chart.js 4.x + `react-chartjs-2`
- **Forms & Validation**: Formik 2.4 + Yup 1.7
- **UI & Icons**: Lucide React, SweetAlert2, React Hot Toast
- **HTTP Client**: Axios with automatic cookie credential passing

### Backend
- **Runtime & Framework**: Node.js + Express 5.2.1
- **Database & ODM**: MongoDB with Mongoose 9.x
- **Authentication**: JWT (`jsonwebtoken`) stored securely with HTTP-only cookies and Authorization headers
- **Password Security**: `bcryptjs` (salt rounds: 12)
- **Input Validation**: Joi 18.x validation schemas applied as Express middleware
- **Security Middlewares**:
  - `helmet`: Secure HTTP headers
  - `express-rate-limit`: Brute force & DDoS protection
  - `express-mongo-sanitize`: NoSQL query injection prevention
  - `hpp`: HTTP parameter pollution protection
  - `cors`: Configured for credentials with specific frontend origin reflection

---

## 📁 Repository Structure

```text
TaskFlow-Suntek-AI-Assesment/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment variables & MongoDB connection
│   │   ├── controllers/     # Route logic (Auth, Task, TimeLog, Summary)
│   │   ├── middleware/      # Auth guard, error handler, rate-limit, Joi validator
│   │   ├── models/          # Mongoose schemas (User, Task, TimeLog)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic & Google Gemini AI service
│   │   ├── utils/           # Time calculation & API response formatters
│   │   └── validators/      # Joi schema definitions
│   ├── .env.example         # Template for environment variables
│   ├── package.json
│   └── server.js            # Express server entry point
│
├── frontend/
│   ├── public/              # Brand logos, icons, and static assets
│   ├── src/
│   │   ├── app/             # Next.js App Router (Dashboard, Tasks, TimeLogs, Auth)
│   │   ├── components/      # UI components (Navbar, TaskCard, CreateTaskModal, ActiveTimer)
│   │   ├── store/           # Redux Toolkit slices (auth, tasks, timelogs, summary)
│   │   └── utils/           # API client, date/time formatting helpers
│   ├── .env.local           # Local frontend environment config
│   ├── next.config.mjs      # Standalone build & API rewrite proxy configuration
│   └── package.json
│
└── README.md                # Project documentation
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js**: v18.x or v20.x installed
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URL
- **Google Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/) *(optional, app has fallback parser)*

---

### 1. Clone the Repository
```bash
git clone https://github.com/AmolSonawane1026/TaskFlow-Suntek-AI-Assesment.git
cd TaskFlow-Suntek-AI-Assesment
```

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Configure your `.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskflow
   JWT_ACCESS_SECRET=your_super_secret_access_key_change_me
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_me
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   CORS_ORIGIN=http://localhost:3000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will be live at `http://localhost:5000`.*

---

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=/api
   BACKEND_INTERNAL_URL=http://localhost:5000
   ```
4. Start the frontend Next.js dev server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 📡 API Reference Overview

All `/api/tasks`, `/api/timelogs`, and `/api/summary` endpoints require a valid Bearer JWT token in the `Authorization` header or HTTP-only auth cookie.

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Log in and receive access/refresh tokens |
| `POST` | `/api/auth/refresh` | Refresh expired access token using refresh token |
| `POST` | `/api/auth/logout` | Invalidate tokens and clear auth cookies |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/tasks` | Create a new task |
| `GET` | `/api/tasks` | Get all tasks (supports query filters: `status`, `priority`, `search`) |
| `GET` | `/api/tasks/:id` | Get single task details |
| `PUT` | `/api/tasks/:id` | Update task fields (status, priority, title, description, etc.) |
| `DELETE` | `/api/tasks/:id` | Delete a task and its associated logs |
| `POST` | `/api/tasks/enhance` | **AI**: Parse natural-language text into structured task data |

### Time Tracking (`/api/timelogs`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/timelogs/start` | Start live timer for a specific task |
| `POST` | `/api/timelogs/stop` | Stop active timer and calculate elapsed seconds |
| `GET` | `/api/timelogs/active` | Retrieve current user's currently running timer (if any) |
| `GET` | `/api/timelogs` | Fetch paginated historical time log sessions |
| `GET` | `/api/timelogs/task/:taskId`| Fetch logged time history for a specific task |

### Analytics & Summary (`/api/summary`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/summary/daily` | Get today's total logged time, completed tasks, and worked-on count |
| `GET` | `/api/summary/weekly` | Get 7-day productivity distribution for charts |
| `GET` | `/api/summary/ai` | **AI**: Generate personalized productivity tips and summary |

---

## 🔒 Security Best Practices Implemented

- **Password Hashing**: Passwords are never stored in plain text; salted with `bcryptjs` at work factor 12.
- **Strict Input Sanitization**: Form inputs and URL parameters are validated against strict `Joi` schemas before hitting controllers.
- **CORS Protection**: Dynamic origin matching strictly allows legitimate frontend origins with credential authorization.
- **NoSQL Injection Defense**: `express-mongo-sanitize` strips out any malicious `$` or `.` operators from client request payloads.
- **XSS & Header Hardening**: Secured with `helmet` for secure HTTP headers.
- **Rate Limiting**: Protects against automated credential stuffing and excessive API polling.

---

## 👨‍💻 Author

**Amol Ramesh Sonawane**  
- **GitHub**: [@AmolSonawane1026](https://github.com/AmolSonawane1026)  
- **Project**: Suntek AI Assessment  

*Crafted with attention to detail, real-time interactivity, and clean code principles.*
