# LifeEase 2.0 — Document Locker & Renewal Reminder Platform

A production-style full-stack web application for securely storing documents, tracking expiry dates, and receiving renewal reminders.

## Project Structure

```
LifeEase 2.0/
├── client/          # React + Vite frontend
└── server/          # Node.js + Express + MongoDB backend
```

## Quick Start

### 1. Backend Setup

```bash
cd server
cp .env.example .env       # Fill in your credentials
npm install
npm run dev                # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev                # Starts on http://localhost:5173
```

### 3. Required Environment Variables (server/.env)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Random secret for token signing |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_HOST` | Email SMTP host (e.g. smtp.gmail.com) |
| `SMTP_USER` | SMTP email address |
| `SMTP_PASS` | SMTP password / app password |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, CSS Modules |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| File Storage | Cloudinary, Multer |
| Email | Nodemailer |
| Cron Jobs | node-cron |
| Security | Helmet, CORS, express-rate-limit |

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | ✗ | Register user |
| POST | /api/auth/login | ✗ | Login |
| GET | /api/auth/me | ✓ | Current user |
| POST | /api/documents | ✓ | Upload document |
| GET | /api/documents | ✓ | List documents |
| GET | /api/documents/:id | ✓ | Get document |
| PATCH | /api/documents/:id | ✓ | Update document |
| PATCH | /api/documents/:id/archive | ✓ | Archive |
| DELETE | /api/documents/:id | ✓ | Delete |
| GET | /api/dashboard/summary | ✓ | Dashboard stats |
| GET | /api/reminders | ✓ | Notifications |
| PATCH | /api/reminders/:id/read | ✓ | Mark read |
| GET | /api/profile | ✓ | Get profile |
| PATCH | /api/profile | ✓ | Update profile |
| PATCH | /api/profile/change-password | ✓ | Change password |
| PATCH | /api/profile/reminder-preferences | ✓ | Update prefs |

## Features

- ✅ JWT Authentication with protected routes
- ✅ File upload to Cloudinary (PDF, JPG, PNG)
- ✅ Document CRUD with category/tag system
- ✅ Auto-computed document status (Active/Expiring Soon/Expired/Archived)
- ✅ Search, filter by category/status, sort, pagination
- ✅ Dashboard with stats, recent docs, upcoming expiry
- ✅ Daily cron job for due reminders
- ✅ In-app notifications + HTML email reminders
- ✅ Profile management with reminder preferences
- ✅ Premium UI based on "The Architectural Vault" Stitch design system
