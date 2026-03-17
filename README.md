# بيئات العمل (Work Environments)

يوجد بيئتان للعمل:

 - **بيئة التطوير (Development):**
	 - ملف البيئة: `.env.development`
	 - لتشغيل بيئة التطوير:
		 1. انسخ ملف البيئة: `cp .env.development .env`
		 2. شغل السيرفر: `npm run dev`

 - **بيئة النشر (Production):**
	 - ملف البيئة: `.env.production`
	 - لتشغيل بيئة النشر:
		 1. انسخ ملف البيئة: `cp .env.production .env`
		 2. بناء المشروع: `npm run build`
		 3. شغل السيرفر: `npm start`

راجع ملف [ENVIRONMENTS.md](ENVIRONMENTS.md) لمزيد من التفاصيل.
# YOD Elazig – Backend API

RESTful API for the **YOD Elazig** Youth Organization platform.  
Built with **TypeScript**, **Express.js**, **MongoDB/Mongoose**, and **JWT authentication**.

---

## Table of Contents

- [Features](#features)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Roles & Permissions](#roles--permissions)
- [Scripts](#scripts)
- [Docker](#docker)

---

## Features

| Category | Details |
|----------|---------|
| **TypeScript** | Strict mode, typed interfaces for all models/services/routes |
| **Authentication** | JWT Access + Refresh tokens, password hashing (bcrypt), forgot/reset password |
| **Authorisation** | Role-Based Access Control (RBAC) – Super Admin, Admin, Editor, Student |
| **Security** | Helmet, CORS, rate limiting, NoSQL injection protection, HPP, data sanitisation |
| **Architecture** | Clean MVC + Service layer, SOLID principles, modular design |
| **Logging** | Winston (file + console) + Morgan HTTP logging |
| **Documentation** | Swagger/OpenAPI auto-generated from JSDoc |
| **Database** | MongoDB with Mongoose ODM, TTL indexes, text indexes |
| **DevEx** | ESLint + @typescript-eslint, Prettier, ts-node-dev, seed script |

---

## Folder Structure

```
server/
├── scripts/
│   └── seed.ts                # Create default admin & sample data
├── src/
│   ├── types/
│   │   ├── express.d.ts       # Express Request augmentation
│   │   └── modules.d.ts       # Third-party module declarations
│   ├── config/
│   │   ├── cors.ts            # CORS options
│   │   ├── db.ts              # MongoDB connection
│   │   └── swagger.ts         # Swagger/OpenAPI config
│   ├── constants/
│   │   ├── httpStatus.ts      # HTTP status codes
│   │   ├── roles.ts           # RBAC role definitions & types
│   │   └── index.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── studentController.ts
│   │   ├── newsController.ts
│   │   ├── eventController.ts
│   │   ├── dashboardController.ts
│   │   └── index.ts
│   ├── middlewares/
│   │   ├── authorizeRoles.ts  # RBAC middleware
│   │   ├── errorHandler.ts    # Global error handler
│   │   ├── notFound.ts        # 404 handler
│   │   ├── rateLimiter.ts     # Rate limiting
│   │   ├── validate.ts        # Express-validator runner
│   │   ├── verifyToken.ts     # JWT verification
│   │   └── index.ts
│   ├── models/
│   │   ├── User.ts            # IUser interface + Model
│   │   ├── Student.ts         # IStudent interface + Model
│   │   ├── News.ts            # INews interface + Model
│   │   ├── Event.ts           # IEvent interface + Model
│   │   ├── RefreshToken.ts    # IRefreshToken interface + Model
│   │   └── index.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── studentRoutes.ts
│   │   ├── newsRoutes.ts
│   │   ├── eventRoutes.ts
│   │   ├── dashboardRoutes.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── studentService.ts
│   │   ├── newsService.ts
│   │   ├── eventService.ts
│   │   ├── dashboardService.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── generateToken.ts
│   │   ├── logger.ts
│   │   ├── slugify.ts
│   │   └── index.ts
│   ├── validators/
│   │   ├── authValidator.ts
│   │   ├── studentValidator.ts
│   │   ├── newsValidator.ts
│   │   ├── eventValidator.ts
│   │   └── index.ts
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Entry point
├── .dockerignore
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── Dockerfile
├── tsconfig.json
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **MongoDB** running locally or a remote URI (Atlas, etc.)

### Installation

```bash
cd server
cp .env.example .env      # configure your environment
npm install
```

### Seed Default Data

```bash
npm run seed
```

This creates:
| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@yod-elazig.org` | `Admin@123456` |
| Editor | `content-editor@yod-elazig.org` | `Editor@123456` |
| Student | `student@yod-elazig.org` | `Student@123456` |

### Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000` with hot-reload via `ts-node-dev`.

### Build & Run Production

```bash
npm run build           # Compile TypeScript → dist/
npm start               # Run compiled JS from dist/
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/yod_elazig` |
| `JWT_SECRET` | Access token signing secret | — |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | — |
| `JWT_EXPIRES_IN` | Access token lifetime | `15m` |
| `REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `NODE_ENV` | `development` / `production` | `development` |
| `CLIENT_URL` | Allowed CORS origin(s) | `http://localhost:5173` |
| `SUPER_ADMIN_EMAIL` | Seed admin email | `admin@yod-elazig.org` |
| `SUPER_ADMIN_PASSWORD` | Seed admin password | `Admin@123456` |
| `SUPER_ADMIN_NAME` | Seed admin name | `Super Admin` |

---

## API Documentation

Interactive Swagger docs are available in development at:

```
http://localhost:5000/api/docs
```

---

## API Endpoints

### Auth (`/api/v1/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login | Public |
| POST | `/refresh-token` | Refresh access token | Public |
| POST | `/logout` | Revoke refresh token | Private |
| POST | `/forgot-password` | Request password reset | Public |
| POST | `/reset-password/:token` | Reset password | Public |
| PUT | `/change-password` | Change password | Private |
| GET | `/me` | Get current user | Private |

### Students (`/api/v1/students`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create student | Admin |
| GET | `/` | List students (paginated) | Admin |
| GET | `/:id` | Get single student | Admin |
| PUT | `/:id` | Update student | Admin |
| PATCH | `/:id/deactivate` | Deactivate student | Admin |
| DELETE | `/:id` | Delete student | Admin |

### News (`/api/v1/news`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List news (paginated) | Public |
| GET | `/slug/:slug` | Get news by slug | Public |
| POST | `/` | Create news | Editor+ |
| GET | `/:id` | Get news by ID | Editor+ |
| PUT | `/:id` | Update news | Editor+ |
| PATCH | `/:id/publish` | Publish news | Editor+ |
| DELETE | `/:id` | Delete news | Admin |

### Events (`/api/v1/events`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List events (paginated) | Public |
| GET | `/upcoming` | Upcoming events | Public |
| GET | `/:id` | Get single event | Public |
| POST | `/` | Create event | Editor+ |
| PUT | `/:id` | Update event | Editor+ |
| DELETE | `/:id` | Delete event | Admin |

### Dashboard (`/api/v1/dashboard`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/stats` | Get dashboard statistics | Admin |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health |

---

## Roles & Permissions

| Role | Code | Permissions |
|------|------|-------------|
| **Super Admin** | `super_admin` | Full access to everything |
| **Admin** | `admin` | Manage students, news, events, dashboard |
| **Editor** | `editor` | Create/edit/publish news & events |
| **Student** | `student` | View own profile, public content |

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server (from `dist/`) |
| `npm run dev` | Start with ts-node-dev (auto-reload) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run seed` | Seed database with default data |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |

---

## Docker

```bash
# Build
docker build -t yod-elazig-api .

# Run
docker run -p 5000:5000 --env-file .env yod-elazig-api
```

---

## License

MIT
