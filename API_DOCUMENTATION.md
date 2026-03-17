# YOD Elazığ — API Documentation (Client Guide)

> **Base URL:** `http://localhost:5000/api/v1`
> **Swagger UI:** `http://localhost:5000/api/docs`
> **Health Check:** `GET http://localhost:5000/api/health`

---

## Table of Contents

1. [General Information](#1-general-information)
2. [Authentication](#2-authentication)
3. [News](#3-news)
4. [Events](#4-events)
5. [Programs](#5-programs)
6. [Achievements](#6-achievements)
7. [FAQ](#7-faq)
8. [Resources](#8-resources)
9. [Pages](#9-pages)
10. [Settings](#10-settings)
11. [Contact Form](#11-contact-form)
12. [Volunteer Applications](#12-volunteer-applications)
13. [Photo Gallery](#13-photo-gallery)
14. [News Ticker](#14-news-ticker)
15. [Translations (i18n)](#15-translations-i18n)
16. [Students](#16-students)
17. [Media & Uploads](#17-media--uploads)
18. [Dashboard](#18-dashboard)
19. [Error Handling](#19-error-handling)

---

## 1. General Information

### 1.1 Response Format

All API responses follow this standard structure:

```json
{
  "success": true,
  "message": "Descriptive message",
  "data": { ... }
}
```

On error:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Please provide a valid email" }
  ]
}
```

### 1.2 Authentication Header

Protected endpoints require a **Bearer Token** in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

### 1.3 User Roles

| Role | Value | Description |
|------|-------|-------------|
| Super Admin | `super_admin` | Full system access |
| Admin | `admin` | Administrative access |
| Editor | `editor` | Content management (news, events, programs…) |
| Student | `student` | Default role on registration |

### 1.4 i18n (Internationalization)

The API supports **3 languages**: Arabic (`ar`), English (`en`), Turkish (`tr`).

**How it works:**
- Content modules (Programs, Achievements, FAQ, Resources, Pages, Gallery, Ticker, Settings) store text as multilingual objects:
  ```json
  {
    "title": {
      "ar": "العنوان بالعربية",
      "en": "Title in English",
      "tr": "Türkçe başlık"
    }
  }
  ```
- Send `Accept-Language` header to set `req.lang` (defaults to `tr`):
  ```
  Accept-Language: ar
  ```
- The `req.lang` is available for server-side filtering but currently full i18n objects are returned. The **client should pick the right language** from the object.

### 1.5 Rate Limiting

| Limiter | Limit | Window |
|---------|-------|--------|
| General API | 100 requests | 15 minutes |
| Auth Endpoints | 20 requests | 15 minutes |

When exceeded → `429 Too Many Requests`:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

### 1.6 CORS

Allowed origins configured via `CLIENT_URL` env var (default: `http://localhost:5173`).
Allowed methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.

### 1.7 Pagination Convention

List endpoints typically accept these query parameters:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | — | Search query |
| `sort` | string | `-createdAt` | Sort field (prefix `-` for desc) |
| `category` | string | — | Filter by category |

---

## 2. Authentication

**Base:** `/api/v1/auth`

### 2.1 Register

```
POST /auth/register
```

**Access:** Public

**Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ | 2–100 characters |
| `email` | string | ✅ | Valid email format |
| `password` | string | ✅ | Min 8 chars, must contain at least 1 letter + 1 number |

**Request:**
```json
{
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "password": "MyPass123"
}
```

**Response** `201`:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "Ahmed Ali",
      "email": "ahmed@example.com",
      "role": "student",
      "isActive": true
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

### 2.2 Login

```
POST /auth/login
```

**Access:** Public

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Request:**
```json
{
  "email": "admin@yod-elazig.org",
  "password": "Admin@123456"
}
```

**Response** `200`:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "Super Admin",
      "email": "admin@yod-elazig.org",
      "role": "super_admin"
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

### 2.3 Refresh Token

```
POST /auth/refresh-token
```

**Access:** Public

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `refreshToken` | string | ✅ |

**Response** `200`:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbG...(new)...",
    "refreshToken": "eyJhbG...(new)..."
  }
}
```

> **Important:** Each refresh token is single-use. The old refresh token is deleted and a new pair is issued. Store the new `refreshToken` for the next refresh.

### 2.4 Forgot Password

```
POST /auth/forgot-password
```

**Access:** Public

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | ✅ |

**Response** `200`:
```json
{
  "success": true,
  "message": "Password reset token generated",
  "data": {
    "resetToken": "a3f2c1d0..."
  }
}
```

> **Note:** In production this token should be emailed to the user, not returned in the response.

### 2.5 Reset Password

```
POST /auth/reset-password/:token
```

**Access:** Public

**URL Params:** `token` — the reset token from forgot-password

**Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `password` | string | ✅ | Min 8 chars, letter + number |
| `confirmPassword` | string | ✅ | Must match `password` |

### 2.6 Get My Profile

```
GET /auth/me
```

**Access:** 🔒 Authenticated (any role)

**Headers:** `Authorization: Bearer <accessToken>`

**Response** `200`:
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "user": {
      "_id": "...",
      "name": "Super Admin",
      "email": "admin@yod-elazig.org",
      "role": "super_admin",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

### 2.7 Change Password

```
PUT /auth/change-password
```

**Access:** 🔒 Authenticated (any role)

**Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `currentPassword` | string | ✅ | — |
| `newPassword` | string | ✅ | Min 8 chars, letter + number |
| `confirmNewPassword` | string | ✅ | Must match `newPassword` |

### 2.8 Logout

```
POST /auth/logout
```

**Access:** 🔒 Authenticated

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `refreshToken` | string | ✅ |

Deletes the specific refresh token from the database.

### 2.9 Logout from All Devices

```
POST /auth/logout-all
```

**Access:** 🔒 Authenticated

Deletes **all** refresh tokens for the current user.

---

### Token Lifecycle Summary

```
  ┌──────────────┐
  │   Register    │──→ Returns accessToken + refreshToken
  │    Login      │──→ Returns accessToken + refreshToken
  └──────┬───────┘
         │
  ┌──────▼───────┐    Access Token expired?
  │   API Call    │────────────────────────┐
  │ (Bearer tok) │                        │
  └──────┬───────┘                        │
         │ 200 OK                ┌────────▼─────────┐
         │                      │ POST /refresh-token│
         │                      │ { refreshToken }   │
         │                      └────────┬───────────┘
         │                               │
         │                      New accessToken + refreshToken
         │                      (old refreshToken is DELETED)
```

**Access Token** expires in **15 minutes**.
**Refresh Token** expires in **7 days**.

---

## 3. News

**Base:** `/api/v1/news`

### Public Endpoints

#### 3.1 Get Published News

```
GET /news
```

**Query Params:** `page`, `limit`, `search`, `category`, `tag`, `sort`

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "news": [
      {
        "_id": "...",
        "title": "Welcome to YOD",
        "slug": "welcome-to-yod-m2abc",
        "content": "...",
        "summary": "...",
        "coverImage": "https://...",
        "author": { "_id": "...", "name": "Super Admin" },
        "tags": ["announcement"],
        "isPublished": true,
        "views": 42,
        "publishedAt": "2026-01-15T...",
        "createdAt": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### 3.2 Get News by Slug

```
GET /news/slug/:slug
```

Returns a single published news article. Increments `views` counter.

### Admin Endpoints (🔒 SUPER_ADMIN / ADMIN / EDITOR)

#### 3.3 Get All News (Admin)

```
GET /news/admin
```

Returns all news including unpublished. Supports pagination and search.

#### 3.4 Get News by ID

```
GET /news/:id
```

#### 3.5 Create News

```
POST /news
```

**Body:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | ✅ | 3–200 chars |
| `content` | string | ✅ | Min 10 chars |
| `summary` | string | ❌ | Max 500 chars |
| `category` | string | ❌ | Free text |
| `tags` | string[] | ❌ | Array of strings |
| `coverImage` | string | ❌ | Valid URL |
| `isPublished` | boolean | ❌ | Default: `false` |
| `isFeatured` | boolean | ❌ | Default: `false` |

> **Slug** is auto-generated from the title.

**Response** `201`:
```json
{
  "success": true,
  "data": {
    "news": {
      "_id": "...",
      "title": "My Article",
      "slug": "my-article-m2xyz",
      "content": "...",
      "author": "...",
      "isPublished": false,
      "views": 0
    }
  }
}
```

#### 3.6 Update News

```
PUT /news/:id
```

Same fields as create, all optional.

#### 3.7 Delete News

```
DELETE /news/:id
```

**Access:** 🔒 SUPER_ADMIN / ADMIN only

#### 3.8 Toggle Publish

```
PATCH /news/:id/toggle-publish
```

Toggles `isPublished` between `true`/`false`. Sets `publishedAt` on first publish.

---

## 4. Events

**Base:** `/api/v1/events`

### Public Endpoints

#### 4.1 Get Published Events

```
GET /events
```

#### 4.2 Get Upcoming Events

```
GET /events/upcoming
```

Returns events where `startDate > now`.

#### 4.3 Get Event by Slug

```
GET /events/slug/:slug
```

### Admin Endpoints (🔒 SUPER_ADMIN / ADMIN / EDITOR)

#### 4.4 Get All Events

```
GET /events/admin
```

#### 4.5 Get Event by ID

```
GET /events/:id
```

#### 4.6 Create Event

```
POST /events
```

**Body:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | ✅ | 3–200 chars |
| `description` | string | ✅ | Min 10 chars |
| `startDate` | string (ISO 8601) | ✅ | e.g. `"2026-03-15T10:00:00Z"` |
| `endDate` | string (ISO 8601) | ❌ | |
| `location` | string | ❌ | Max 300 chars |
| `category` | string | ❌ | |
| `capacity` | number | ❌ | Min 1 |
| `coverImage` | string | ❌ | Valid URL |
| `isPublished` | boolean | ❌ | Default: `false` |
| `isFeatured` | boolean | ❌ | Default: `false` |
| `registrationDeadline` | string (ISO 8601) | ❌ | |

#### 4.7 Update Event

```
PUT /events/:id
```

#### 4.8 Delete Event

```
DELETE /events/:id
```

**Access:** 🔒 SUPER_ADMIN / ADMIN only

#### 4.9 Toggle Publish

```
PATCH /events/:id/toggle-publish
```

### Event Registration (🔒 Any Authenticated User)

#### 4.10 Register for Event

```
POST /events/:id/register
```

Adds the authenticated user to the event's `attendees` array.

#### 4.11 Unregister from Event

```
DELETE /events/:id/register
```

Removes the authenticated user from the `attendees` array.

---

## 5. Programs

**Base:** `/api/v1/programs`

> **i18n Module:** Title, description, and summary are multilingual objects `{ ar, en, tr }`.

### Public Endpoints

#### 5.1 Get Published Programs

```
GET /programs
```

#### 5.2 Get Program by Slug

```
GET /programs/slug/:slug
```

### Admin Endpoints (🔒 SUPER_ADMIN / ADMIN / EDITOR)

#### 5.3 Get All Programs

```
GET /programs/admin
```

#### 5.4 Get Program by ID

```
GET /programs/:id
```

#### 5.5 Create Program

```
POST /programs
```

**Body:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title.ar` | string | ✅ | Arabic title |
| `title.en` | string | ✅ | English title |
| `title.tr` | string | ✅ | Turkish title |
| `description.ar` | string | ✅ | |
| `description.en` | string | ✅ | |
| `description.tr` | string | ✅ | |
| `summary.ar` | string | ❌ | |
| `summary.en` | string | ❌ | |
| `summary.tr` | string | ❌ | |
| `startDate` | string (ISO 8601) | ✅ | |
| `endDate` | string (ISO 8601) | ❌ | |
| `location` | string | ❌ | |
| `category` | string | ❌ | |
| `tags` | string[] | ❌ | |
| `coverImage` | string | ❌ | |
| `isPublished` | boolean | ❌ | Default: `false` |

**Request Example:**
```json
{
  "title": {
    "ar": "برنامج تعليمي",
    "en": "Educational Program",
    "tr": "Eğitim Programı"
  },
  "description": {
    "ar": "وصف البرنامج بالعربية",
    "en": "Program description in English",
    "tr": "Türkçe program açıklaması"
  },
  "startDate": "2026-04-01T09:00:00Z",
  "endDate": "2026-06-30T17:00:00Z",
  "isPublished": true
}
```

**Response** `201`:
```json
{
  "success": true,
  "data": {
    "program": {
      "_id": "...",
      "title": { "ar": "...", "en": "...", "tr": "..." },
      "slug": "educational-program-m2xyz",
      "description": { "ar": "...", "en": "...", "tr": "..." },
      "status": "upcoming",
      "isPublished": true
    }
  }
}
```

> **Auto Status:** The `status` field is auto-calculated:
> - `upcoming` — startDate is in the future
> - `ongoing` — between startDate and endDate
> - `completed` — endDate has passed

#### 5.6 Update Program

```
PUT /programs/:id
```

#### 5.7 Delete Program

```
DELETE /programs/:id
```

**Access:** 🔒 SUPER_ADMIN / ADMIN only

#### 5.8 Toggle Publish

```
PATCH /programs/:id/toggle-publish
```

---

## 6. Achievements

**Base:** `/api/v1/achievements`

> **i18n Module:** `title` and `description` are `{ ar, en, tr }` objects.

### Public

#### 6.1 Get Published Achievements

```
GET /achievements
```

### Admin (🔒 SUPER_ADMIN / ADMIN / EDITOR)

#### 6.2 Get All Achievements

```
GET /achievements/admin
```

#### 6.3 Get Achievement by ID

```
GET /achievements/:id
```

#### 6.4 Create Achievement

```
POST /achievements
```

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `title.ar` | string | ✅ |
| `title.en` | string | ✅ |
| `title.tr` | string | ✅ |
| `description.ar` | string | ✅ |
| `description.en` | string | ✅ |
| `description.tr` | string | ✅ |
| `image` | string | ❌ |
| `date` | string (ISO 8601) | ❌ |
| `order` | number | ❌ (default `0`) |
| `isPublished` | boolean | ❌ (default `false`) |

#### 6.5 Update Achievement

```
PUT /achievements/:id
```

#### 6.6 Delete Achievement

```
DELETE /achievements/:id
```

**Access:** 🔒 SUPER_ADMIN / ADMIN only

---

## 7. FAQ

**Base:** `/api/v1/faq`

> **i18n Module:** `question` and `answer` are `{ ar, en, tr }` objects.

### Public

#### 7.1 Get Published FAQs

```
GET /faq
```

Returns FAQs sorted by `order`.

### Admin (🔒 SUPER_ADMIN / ADMIN / EDITOR)

#### 7.2 Get All FAQs

```
GET /faq/admin
```

#### 7.3 Get FAQ by ID

```
GET /faq/:id
```

#### 7.4 Create FAQ

```
POST /faq
```

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `question.ar` | string | ✅ |
| `question.en` | string | ✅ |
| `question.tr` | string | ✅ |
| `answer.ar` | string | ✅ |
| `answer.en` | string | ✅ |
| `answer.tr` | string | ✅ |
| `category` | string | ❌ |
| `order` | number | ❌ (default `0`) |
| `isPublished` | boolean | ❌ (default `true`) |

**Request:**
```json
{
  "question": {
    "ar": "ما هو الاتحاد؟",
    "en": "What is the union?",
    "tr": "Birlik nedir?"
  },
  "answer": {
    "ar": "اتحاد الطلاب اليمنيين في ألازغ",
    "en": "Yemeni students' union in Elazig",
    "tr": "Elazığ'daki Yemenli öğrenci birliği"
  },
  "category": "general",
  "order": 1
}
```

#### 7.5 Update FAQ

```
PUT /faq/:id
```

#### 7.6 Delete FAQ

```
DELETE /faq/:id
```

**Access:** 🔒 SUPER_ADMIN / ADMIN only

#### 7.7 Reorder FAQs

```
PATCH /faq/reorder
```

**Body:**
```json
{
  "items": [
    { "id": "faq_id_1", "order": 0 },
    { "id": "faq_id_2", "order": 1 },
    { "id": "faq_id_3", "order": 2 }
  ]
}
```

---

## 8. Resources

**Base:** `/api/v1/resources`

> **i18n Module:** `title` and `description` are `{ ar, en, tr }` objects.

### Public

#### 8.1 Get Public Resources

```
GET /resources
```

### Admin (🔒 SUPER_ADMIN / ADMIN / EDITOR)

#### 8.2 Get All Resources

```
GET /resources/admin
```

#### 8.3 Get Resource by ID

```
GET /resources/:id
```

#### 8.4 Create Resource

```
POST /resources
```

**Body:**

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `title.ar` | string | ✅ | |
| `title.en` | string | ✅ | |
| `title.tr` | string | ✅ | |
| `description.ar` | string | ❌ | |
| `description.en` | string | ❌ | |
| `description.tr` | string | ❌ | |
| `url` | string | ✅ | URL to file/video/page |
| `type` | string | ❌ | `document`, `video`, `link`, `image`, `other` (default: `link`) |
| `category` | string | ✅ | Free text |
| `isPublic` | boolean | ❌ | Default: `true` |
| `allowedRoles` | string[] | ❌ | Restrict to specific roles |
| `order` | number | ❌ | Default: `0` |
| `isPublished` | boolean | ❌ | Default: `false` |

#### 8.5 Update Resource

```
PUT /resources/:id
```

#### 8.6 Delete Resource

```
DELETE /resources/:id
```

**Access:** 🔒 SUPER_ADMIN / ADMIN only

---

## 9. Pages

**Base:** `/api/v1/pages`

> **i18n Module:** `title` and `content` are `{ ar, en, tr }` objects.

Static pages managed by key. Available keys:

| Key | Description |
|-----|-------------|
| `about-union` | About the Union page |
| `about-city` | About Elazig city page |
| `about-university` | About the university page |

### Public

#### 9.1 Get Page by Slug

```
GET /pages/slug/:slug
```

### Admin (🔒 SUPER_ADMIN / ADMIN)

#### 9.2 Get All Pages

```
GET /pages
```

#### 9.3 Get Page by Key

```
GET /pages/:key
```

#### 9.4 Upsert Page (Create or Update)

```
PUT /pages/:key
```

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `title.ar` | string | ✅ |
| `title.en` | string | ✅ |
| `title.tr` | string | ✅ |
| `content.ar` | string | ✅ |
| `content.en` | string | ✅ |
| `content.tr` | string | ✅ |
| `coverImage` | string | ❌ |
| `isPublished` | boolean | ❌ (default `true`) |

**Request:**
```json
PUT /pages/about-union

{
  "title": {
    "ar": "عن الاتحاد",
    "en": "About the Union",
    "tr": "Birlik Hakkında"
  },
  "content": {
    "ar": "<h1>اتحاد الطلاب اليمنيين</h1><p>...</p>",
    "en": "<h1>Yemeni Students Union</h1><p>...</p>",
    "tr": "<h1>Yemenli Öğrenci Birliği</h1><p>...</p>"
  }
}
```

> This endpoint uses **upsert** logic — creates the page if it doesn't exist, updates if it does.

---

## 10. Settings

**Base:** `/api/v1/settings`

A singleton document (key: `general`). Only one settings document exists.

### Public

#### 10.1 Get Settings

```
GET /settings
```

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "settings": {
      "socialLinks": {
        "facebook": "https://facebook.com/yodelazig",
        "instagram": "https://instagram.com/yodelazig",
        "twitter": "",
        "youtube": "",
        "telegram": "",
        "whatsapp": "",
        "linkedin": "",
        "tiktok": ""
      },
      "contactInfo": {
        "email": "info@yod-elazig.org",
        "phone": "+90 555 123 4567",
        "address": {
          "ar": "العنوان بالعربية",
          "en": "Address in English",
          "tr": "Türkçe adres"
        }
      },
      "footer": {
        "text": { "ar": "...", "en": "...", "tr": "..." },
        "copyright": { "ar": "...", "en": "...", "tr": "..." }
      },
      "logo": "/uploads/logo.png",
      "favicon": "/uploads/favicon.ico"
    }
  }
}
```

### Admin (🔒 SUPER_ADMIN / ADMIN)

#### 10.2 Update Settings

```
PUT /settings
```

**Body** (all fields optional — send only what you want to update):

```json
{
  "socialLinks": {
    "facebook": "https://facebook.com/yodelazig",
    "instagram": "https://instagram.com/yodelazig"
  },
  "contactInfo": {
    "email": "info@yod-elazig.org",
    "phone": "+90 555 123 4567",
    "address": {
      "ar": "ألازغ، تركيا",
      "en": "Elazig, Turkey",
      "tr": "Elazığ, Türkiye"
    }
  },
  "footer": {
    "text": {
      "ar": "اتحاد الطلاب اليمنيين",
      "en": "Yemeni Students Union",
      "tr": "Yemenli Öğrenci Birliği"
    },
    "copyright": {
      "ar": "© 2026 جميع الحقوق محفوظة",
      "en": "© 2026 All rights reserved",
      "tr": "© 2026 Tüm hakları saklıdır"
    }
  },
  "logo": "/uploads/logo.png",
  "favicon": "/uploads/favicon.ico"
}
```

---

## 11. Contact Form

**Base:** `/api/v1/contacts`

### Public

#### 11.1 Submit Contact Form

```
POST /contacts
```

**Body:**

| Field | Type | Required | Max Length |
|-------|------|----------|-----------|
| `name` | string | ✅ | 100 |
| `email` | string | ✅ | Valid email |
| `subject` | string | ✅ | 200 |
| `message` | string | ✅ | 2000 |

**Request:**
```json
{
  "name": "Khalid Mohammed",
  "email": "khalid@example.com",
  "subject": "Membership Inquiry",
  "message": "I would like to know about joining the union."
}
```

**Response** `201`:
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "data": {
    "contact": {
      "_id": "...",
      "name": "Khalid Mohammed",
      "email": "khalid@example.com",
      "subject": "Membership Inquiry",
      "status": "new"
    }
  }
}
```

### Admin (🔒 SUPER_ADMIN / ADMIN)

#### 11.2 Get All Contacts

```
GET /contacts
```

Supports `page`, `limit`, `status` (filter by `new`/`read`/`replied`).

#### 11.3 Get Contact Stats

```
GET /contacts/stats
```

Returns counts by status:
```json
{
  "data": {
    "total": 50,
    "new": 10,
    "read": 25,
    "replied": 15
  }
}
```

#### 11.4 Get Contact by ID

```
GET /contacts/:id
```

#### 11.5 Mark as Read

```
PATCH /contacts/:id/read
```

Changes status from `new` → `read`.

#### 11.6 Reply to Contact

```
POST /contacts/:id/reply
```

**Body:**

| Field | Type | Required | Max Length |
|-------|------|----------|-----------|
| `replyMessage` | string | ✅ | 2000 |

Changes status to `replied`, stores `repliedAt`, `repliedBy`, `replyMessage`.

#### 11.7 Delete Contact

```
DELETE /contacts/:id
```

---

## 12. Volunteer Applications

**Base:** `/api/v1/volunteers`

### Public

#### 12.1 Submit Volunteer Application

```
POST /volunteers
```

**Body:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ | Max 100 chars |
| `email` | string | ✅ | Valid email |
| `phone` | string | ✅ | |
| `university` | string | ❌ | |
| `department` | string | ❌ | |
| `yearOfStudy` | number | ❌ | 1–8 |
| `skills` | string[] | ❌ | |
| `motivation` | string | ✅ | Max 2000 chars |
| `availableHours` | number | ❌ | Hours per week |

**Request:**
```json
{
  "name": "Sara Ahmed",
  "email": "sara@example.com",
  "phone": "+90 555 987 6543",
  "university": "Fırat Üniversitesi",
  "department": "Computer Science",
  "yearOfStudy": 3,
  "skills": ["design", "translation", "social media"],
  "motivation": "I want to contribute to the community and improve my skills."
}
```

### Admin (🔒 SUPER_ADMIN / ADMIN)

#### 12.2 Get All Volunteers

```
GET /volunteers
```

Supports `page`, `limit`, `status` filter (`pending`/`accepted`/`rejected`).

#### 12.3 Get Volunteer Stats

```
GET /volunteers/stats
```

```json
{
  "data": {
    "total": 30,
    "pending": 10,
    "accepted": 15,
    "rejected": 5
  }
}
```

#### 12.4 Export Volunteers

```
GET /volunteers/export
```

Returns volunteer data in a downloadable format (JSON).

#### 12.5 Get Volunteer by ID

```
GET /volunteers/:id
```

#### 12.6 Review Volunteer

```
PATCH /volunteers/:id/review
```

**Body:**

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `status` | string | ✅ | `accepted` or `rejected` |
| `reviewNote` | string | ❌ | |

#### 12.7 Delete Volunteer

```
DELETE /volunteers/:id
```

---

## 13. Photo Gallery

**Base:** `/api/v1/gallery`

> **i18n Module:** Album `title`, `description`, and photo `caption` are `{ ar, en, tr }` objects.

### Public

#### 13.1 Get Published Albums

```
GET /gallery
```

#### 13.2 Get Album by Slug

```
GET /gallery/slug/:slug
```

Returns full album with all photos.

### Admin (🔒 SUPER_ADMIN / ADMIN / EDITOR)

#### 13.3 Get All Albums

```
GET /gallery/admin
```

#### 13.4 Get Album by ID

```
GET /gallery/:id
```

#### 13.5 Create Album

```
POST /gallery
```

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `title.ar` | string | ✅ |
| `title.en` | string | ✅ |
| `title.tr` | string | ✅ |
| `description.ar` | string | ❌ |
| `description.en` | string | ❌ |
| `description.tr` | string | ❌ |
| `coverImage` | string | ❌ |
| `category` | string | ❌ |
| `order` | number | ❌ |
| `isPublished` | boolean | ❌ (default `false`) |

#### 13.6 Update Album

```
PUT /gallery/:id
```

#### 13.7 Delete Album

```
DELETE /gallery/:id
```

**Access:** 🔒 SUPER_ADMIN / ADMIN only

#### 13.8 Add Photos to Album

```
POST /gallery/:id/photos
```

**Body:**
```json
{
  "photos": [
    {
      "url": "https://example.com/photo1.jpg",
      "caption": {
        "ar": "صورة من الفعالية",
        "en": "Event photo",
        "tr": "Etkinlik fotoğrafı"
      },
      "order": 0
    },
    {
      "url": "https://example.com/photo2.jpg",
      "caption": {
        "ar": "صورة ثانية",
        "en": "Second photo",
        "tr": "İkinci fotoğraf"
      },
      "order": 1
    }
  ]
}
```

#### 13.9 Remove Photo from Album

```
DELETE /gallery/:id/photos/:photoId
```

#### 13.10 Reorder Photos

```
PATCH /gallery/:id/photos/reorder
```

**Body:**
```json
{
  "photos": [
    { "id": "photo_id_1", "order": 0 },
    { "id": "photo_id_2", "order": 1 }
  ]
}
```

---

## 14. News Ticker

**Base:** `/api/v1/ticker`

> **i18n Module:** `text` is a `{ ar, en, tr }` object.

Scrolling ticker/marquee text shown on the website.

### Public

#### 14.1 Get Active Tickers

```
GET /ticker
```

Returns only `isActive: true` tickers, sorted by `order`.

### Admin (🔒 SUPER_ADMIN / ADMIN)

#### 14.2 Get All Tickers

```
GET /ticker/admin
```

#### 14.3 Get Ticker by ID

```
GET /ticker/:id
```

#### 14.4 Create Ticker

```
POST /ticker
```

**Body:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `text.ar` | string | ✅ | Max 300 chars |
| `text.en` | string | ✅ | Max 300 chars |
| `text.tr` | string | ✅ | Max 300 chars |
| `url` | string | ❌ | Link when ticker is clicked |
| `order` | number | ❌ | Display order |
| `isActive` | boolean | ❌ | Default: `true` |
| `startDate` | string (ISO 8601) | ❌ | Schedule start |
| `endDate` | string (ISO 8601) | ❌ | Schedule end |

#### 14.5 Update Ticker

```
PUT /ticker/:id
```

#### 14.6 Delete Ticker

```
DELETE /ticker/:id
```

#### 14.7 Bulk Update Tickers

```
PUT /ticker/bulk
```

Replace or update multiple tickers at once.

---

## 15. Translations (i18n)

**Base:** `/api/v1/translations`

Manage UI translation strings (for the frontend). Translations are organized by **language** → **namespace** → **key/value pairs**.

### Public

#### 15.1 Get All Translations for a Language

```
GET /translations/:lang
```

**Params:** `lang` = `ar` | `en` | `tr`

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "translations": {
      "common": {
        "greeting": "Hello",
        "farewell": "Goodbye"
      },
      "nav": {
        "home": "Home",
        "about": "About"
      }
    }
  }
}
```

#### 15.2 Get Translations by Namespace

```
GET /translations/:lang/:namespace
```

**Example:** `GET /translations/ar/common`

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "translations": {
      "greeting": "مرحبا",
      "farewell": "مع السلامة"
    }
  }
}
```

### Admin (🔒 SUPER_ADMIN / ADMIN)

#### 15.3 Upsert Single Translation

```
POST /translations
```

**Body:**

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `lang` | string | ✅ | `ar`, `en`, `tr` |
| `namespace` | string | ✅ | e.g. `common`, `nav`, `auth` |
| `key` | string | ✅ | Translation key |
| `value` | string | ✅ | Translation value |

**Request:**
```json
{
  "lang": "en",
  "namespace": "nav",
  "key": "home",
  "value": "Home"
}
```

> **Upsert:** Creates if doesn't exist, updates if already exists.

#### 15.4 Bulk Upsert Translations

```
POST /translations/bulk
```

**Body:**
```json
{
  "lang": "ar",
  "namespace": "common",
  "translations": {
    "greeting": "مرحبا",
    "farewell": "مع السلامة",
    "welcome": "أهلا وسهلا"
  }
}
```

#### 15.5 Delete Translation

```
DELETE /translations/:lang/:namespace/:key
```

**Example:** `DELETE /translations/en/common/greeting`

---

## 16. Students

**Base:** `/api/v1/students`

> **All endpoints are protected (🔒)**

### 16.1 Get My Profile (Student)

```
GET /students/me
```

**Access:** 🔒 Any authenticated user

Returns the student profile linked to the current user.

### Admin (🔒 SUPER_ADMIN / ADMIN / EDITOR for read, SUPER_ADMIN / ADMIN for write)

#### 16.2 Get All Students

```
GET /students
```

#### 16.3 Get Student by ID

```
GET /students/:id
```

#### 16.4 Create Student

```
POST /students
```

**Access:** 🔒 SUPER_ADMIN / ADMIN only

**Body:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ | 2–100 chars |
| `email` | string | ✅ | Valid email (unique) |
| `password` | string | ✅ | Min 8 chars |
| `university` | string | ❌ | Max 200 chars |
| `department` | string | ❌ | Max 200 chars |
| `yearOfStudy` | number | ❌ | 1–8 |
| `phone` | string | ❌ | |
| `nationality` | string | ❌ | |
| `address` | string | ❌ | |

> This creates **both** a `User` (role=student) and a `Student` profile linked to it.

#### 16.5 Update Student

```
PUT /students/:id
```

**Access:** 🔒 SUPER_ADMIN / ADMIN only

#### 16.6 Delete Student

```
DELETE /students/:id
```

**Access:** 🔒 SUPER_ADMIN / ADMIN only

---

## 17. Media & Uploads

**Base:** `/api/v1/media`

> **All endpoints are protected (🔒 SUPER_ADMIN / ADMIN / EDITOR)**

Used for uploading images and documents. Files are processed by **sharp** (images) and stored on the server.

### 17.1 Get All Media

```
GET /media
```

Supports `page`, `limit`, `folder`, `mimetype` query params.

**Response:**
```json
{
  "data": {
    "media": [
      {
        "_id": "...",
        "filename": "hero-banner-1708000000.webp",
        "originalName": "hero.png",
        "mimetype": "image/webp",
        "size": 45320,
        "url": "/uploads/general/hero-banner-1708000000.webp",
        "thumbnailUrl": "/uploads/general/thumb-hero-banner-1708000000.webp",
        "alt": "Hero banner",
        "folder": "general",
        "uploadedBy": { "_id": "...", "name": "Admin" }
      }
    ]
  }
}
```

### 17.2 Get Media by ID

```
GET /media/:id
```

### 17.3 Upload Single File

```
POST /media/upload
```

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `file` | File | ✅ | Max 10MB |
| `alt` | string | ❌ | Alt text |
| `folder` | string | ❌ | Folder name (default: `general`) |

**Allowed MIME types:**
- Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`
- Documents: `application/pdf`, Word (`.doc`, `.docx`), Excel (`.xls`, `.xlsx`)

**Example (fetch):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('alt', 'Event photo');
formData.append('folder', 'events');

const res = await fetch('/api/v1/media/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**Response** `201`:
```json
{
  "data": {
    "media": {
      "_id": "...",
      "filename": "event-photo-1708000000.webp",
      "originalName": "IMG_001.jpg",
      "mimetype": "image/webp",
      "size": 32768,
      "url": "/uploads/events/event-photo-1708000000.webp",
      "thumbnailUrl": "/uploads/events/thumb-event-photo-1708000000.webp"
    }
  }
}
```

> **Image Processing:** Images are automatically converted to WebP format. Thumbnails are auto-generated.

### 17.4 Upload Multiple Files

```
POST /media/upload/multiple
```

**Content-Type:** `multipart/form-data`

| Field | Type | Max |
|-------|------|-----|
| `files` | File[] | Max 10 files |

### 17.5 Update Media Alt Text

```
PATCH /media/:id
```

**Body:**
```json
{ "alt": "Updated alt text" }
```

### 17.6 Delete Media

```
DELETE /media/:id
```

**Access:** 🔒 SUPER_ADMIN / ADMIN only

### Static File Access

Uploaded files are served from:

```
GET /uploads/<folder>/<filename>
```

Example: `http://localhost:5000/uploads/events/event-photo-1708000000.webp`

---

## 18. Dashboard

**Base:** `/api/v1/dashboard`

**Access:** 🔒 SUPER_ADMIN / ADMIN only

### 18.1 Get Dashboard Stats

```
GET /dashboard
```

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "stats": {
      "users": {
        "total": 25,
        "active": 23,
        "byRole": {
          "super_admin": 1,
          "admin": 2,
          "editor": 3,
          "student": 19
        }
      },
      "students": {
        "total": 19,
        "active": 17
      },
      "news": {
        "total": 12,
        "published": 8
      },
      "events": {
        "total": 6,
        "upcoming": 3,
        "published": 4
      },
      "programs": {
        "total": 5,
        "published": 3,
        "byStatus": {
          "upcoming": 2,
          "ongoing": 1,
          "completed": 2
        }
      },
      "contacts": {
        "total": 50,
        "new": 10,
        "read": 25,
        "replied": 15
      },
      "volunteers": {
        "total": 30,
        "pending": 10,
        "accepted": 15,
        "rejected": 5
      },
      "gallery": {
        "albums": 8,
        "photos": 120
      },
      "content": {
        "achievements": 10,
        "faqs": 15,
        "resources": 8,
        "pages": 3,
        "tickers": 4
      }
    }
  }
}
```

---

## 19. Error Handling

### Standard Error Codes

| Code | Name | Common Cause |
|------|------|-------------|
| `400` | Bad Request | Invalid ObjectId, malformed data |
| `401` | Unauthorized | No/invalid/expired token |
| `403` | Forbidden | Insufficient role permissions |
| `404` | Not Found | Resource or route doesn't exist |
| `409` | Conflict | Duplicate unique field (email, slug) |
| `422` | Unprocessable | Validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server issue |

### Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

### Validation Error (`422`)

Returned when request body fails express-validator checks:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "title.ar", "message": "Arabic title is required" },
    { "field": "title.en", "message": "English title is required" }
  ]
}
```

### Duplicate Key Error (`409`)

```json
{
  "success": false,
  "message": "Duplicate value for field(s): email"
}
```

### Not Found Route

```json
{
  "success": false,
  "message": "Route not found: /api/v1/nonexistent"
}
```

---

## Quick Reference — Endpoint Access Matrix

### Public Endpoints (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/auth/register` | Register user |
| `POST` | `/auth/login` | Login |
| `POST` | `/auth/refresh-token` | Refresh token |
| `POST` | `/auth/forgot-password` | Forgot password |
| `POST` | `/auth/reset-password/:token` | Reset password |
| `GET` | `/news` | Published news |
| `GET` | `/news/slug/:slug` | News by slug |
| `GET` | `/events` | Published events |
| `GET` | `/events/upcoming` | Upcoming events |
| `GET` | `/events/slug/:slug` | Event by slug |
| `GET` | `/programs` | Published programs |
| `GET` | `/programs/slug/:slug` | Program by slug |
| `GET` | `/achievements` | Published achievements |
| `GET` | `/faq` | Published FAQs |
| `GET` | `/resources` | Public resources |
| `GET` | `/pages/slug/:slug` | Page by slug |
| `GET` | `/settings` | Site settings |
| `POST` | `/contacts` | Submit contact form |
| `POST` | `/volunteers` | Submit volunteer app |
| `GET` | `/gallery` | Published albums |
| `GET` | `/gallery/slug/:slug` | Album by slug |
| `GET` | `/ticker` | Active tickers |
| `GET` | `/translations/:lang` | All translations |
| `GET` | `/translations/:lang/:ns` | Translations by namespace |

### Authenticated Endpoints (Any Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/me` | My profile |
| `PUT` | `/auth/change-password` | Change password |
| `POST` | `/auth/logout` | Logout |
| `POST` | `/auth/logout-all` | Logout all devices |
| `POST` | `/events/:id/register` | Register for event |
| `DELETE` | `/events/:id/register` | Unregister from event |
| `GET` | `/students/me` | My student profile |

### Editor+ Endpoints (editor, admin, super_admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/news/admin` | All news |
| `GET` | `/news/:id` | News by ID |
| `POST` | `/news` | Create news |
| `PUT` | `/news/:id` | Update news |
| `PATCH` | `/news/:id/toggle-publish` | Toggle news publish |
| `GET` | `/events/admin` | All events |
| `GET` | `/events/:id` | Event by ID |
| `POST` | `/events` | Create event |
| `PUT` | `/events/:id` | Update event |
| `PATCH` | `/events/:id/toggle-publish` | Toggle event publish |
| `GET/POST/PUT` | `/programs/*` | Program CRUD |
| `PATCH` | `/programs/:id/toggle-publish` | Toggle program publish |
| `GET/POST/PUT` | `/achievements/*` | Achievement CRUD |
| `GET/POST/PUT` | `/faq/*` | FAQ CRUD |
| `PATCH` | `/faq/reorder` | Reorder FAQs |
| `GET/POST/PUT` | `/resources/*` | Resource CRUD |
| `GET/POST/PUT` | `/gallery/*` | Gallery CRUD + photos |
| `GET/POST/PATCH` | `/media/*` | Media management |
| `GET` | `/students` | List students |
| `GET` | `/students/:id` | Student by ID |

### Admin+ Endpoints (admin, super_admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `DELETE` | `/news/:id` | Delete news |
| `DELETE` | `/events/:id` | Delete event |
| `DELETE` | `/programs/:id` | Delete program |
| `DELETE` | `/achievements/:id` | Delete achievement |
| `DELETE` | `/faq/:id` | Delete FAQ |
| `DELETE` | `/resources/:id` | Delete resource |
| `GET/PUT` | `/pages/*` | Page management |
| `PUT` | `/settings` | Update settings |
| `GET/PATCH/DELETE` | `/contacts/*` | Contact management |
| `GET/PATCH/DELETE` | `/volunteers/*` | Volunteer management |
| `DELETE` | `/gallery/:id` | Delete album |
| `GET/POST/PUT/DELETE` | `/ticker/*` | Ticker management |
| `POST/DELETE` | `/translations/*` | Translation management |
| `DELETE` | `/media/:id` | Delete media |
| `POST/PUT/DELETE` | `/students/*` | Student CRUD |
| `GET` | `/dashboard` | Dashboard stats |

---

## Client Integration Examples

### Axios Setup (Recommended)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach token to every request ────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Send current language
  const lang = localStorage.getItem('lang') || 'tr';
  config.headers['Accept-Language'] = lang;

  return config;
});

// ── Auto-refresh on 401 ─────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          'http://localhost:5000/api/v1/auth/refresh-token',
          { refreshToken }
        );

        // Store new tokens
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Login Flow

```typescript
async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });

  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.data.user));

  return data.data.user;
}
```

### Fetching i18n Content

```typescript
// Get FAQ for current language
const lang = 'ar'; // or from user preference

const { data } = await api.get('/faq');

// data.data.faqs is an array of FAQ objects with:
// { question: { ar, en, tr }, answer: { ar, en, tr } }

// Display in current language:
const faqs = data.data.faqs.map(faq => ({
  question: faq.question[lang],
  answer: faq.answer[lang],
}));
```

### Fetching UI Translations

```typescript
// Load all translations at app startup
const lang = 'ar';
const { data } = await api.get(`/translations/${lang}`);

// data.data.translations = {
//   common: { greeting: "مرحبا", ... },
//   nav: { home: "الرئيسية", ... }
// }

// Use in i18n library (e.g., i18next, vue-i18n):
i18n.addResourceBundle(lang, 'common', data.data.translations.common);
i18n.addResourceBundle(lang, 'nav', data.data.translations.nav);
```

### File Upload

```typescript
async function uploadImage(file: File, folder = 'general') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const { data } = await api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  // data.data.media.url = "/uploads/general/filename.webp"
  return `http://localhost:5000${data.data.media.url}`;
}
```

### Contact Form Submission

```typescript
async function submitContact(form: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const { data } = await api.post('/contacts', form);
  // No auth needed — public endpoint
  return data;
}
```

---

## Default Credentials (Development)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@yod-elazig.org` | `Admin@123456` |
| Editor | `editor@yod-elazig.org` | `Editor@123456` |

> Run `npm run seed` to create these default users.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `5000` | Server port |
| `MONGO_URI` | — | MongoDB connection string |
| `JWT_SECRET` | — | Access token signing secret |
| `JWT_REFRESH_SECRET` | — | Refresh token signing secret |
| `JWT_EXPIRES_IN` | `15m` | Access token expiry |
| `REFRESH_EXPIRES_IN` | `7d` | Refresh token expiry |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origins (comma-separated) |
