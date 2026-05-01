# Team Task Manager

A full-stack web app for managing projects and tasks with role-based access control.

## Features
- JWT Authentication (Signup/Login)
- Role-based access: Admin & Member
- Project creation and team management
- Task creation, assignment, status tracking
- Dashboard with stats (total, in-progress, done, overdue)

## Tech Stack
- **Backend:** Node.js, Express.js, MongoDB, JWT
- **Frontend:** HTML, Tailwind CSS, Vanilla JS

## Setup

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI and JWT_SECRET in .env
npm run dev
```

### 3. Frontend
Open `frontend/index.html` in browser or use Live Server in VS Code.

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user

### Projects (Admin only for create/update/delete)
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get tasks (filtered by role)
- `POST /api/tasks` - Create task (Admin only)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (Admin only)
- `GET /api/tasks/stats/dashboard` - Dashboard stats

## Deployment (Railway)
1. Push backend to GitHub
2. Connect Railway to your GitHub repo
3. Set environment variables in Railway dashboard
4. Deploy!
