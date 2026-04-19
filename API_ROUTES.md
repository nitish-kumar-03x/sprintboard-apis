# Standardized API Routes

## Authentication Endpoints
**Path:** `/auth`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|-----------------|
| POST | `/register` | Register new user | Not required |
| POST | `/login` | Login user | Not required |
| GET | `/me` | Get current user info | Required |
| GET | `/users` | Get all users list | Required |

### Example Calls:
```javascript
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
GET /api/auth/users
```

---

## Task Endpoints
**Path:** `/tasks`

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/` | Create new task | Yes | Manager |
| POST | `/list` | Get all tasks (with filters & pagination) | Yes | Any |
| GET | `/:id` | Get single task by ID | Yes | Any |
| PUT | `/:id` | Update task details (title, description, dates, tags) | Yes | Manager |
| DELETE | `/:id` | Delete task (soft delete with isDeleted flag) | Yes | Manager |
| POST | `/:id/assign` | Assign task to user (first assignment) | Yes | Manager |
| PUT | `/:id/assign` | Reassign task to different user | Yes | Manager |
| PUT | `/:id/status` | Update task status | Yes | Any |
| POST | `/:id/comments` | Add comment to task | Yes | Any |
| PUT | `/:id/progress` | Update task progress (0-100) | Yes | Employee |

### Example Calls:
```javascript
POST /api/tasks
POST /api/tasks/list
GET /api/tasks/63f2c1a8b3d5e9f1a2c3d4e5
PUT /api/tasks/63f2c1a8b3d5e9f1a2c3d4e5
DELETE /api/tasks/63f2c1a8b3d5e9f1a2c3d4e5
POST /api/tasks/63f2c1a8b3d5e9f1a2c3d4e5/assign
PUT /api/tasks/63f2c1a8b3d5e9f1a2c3d4e5/assign
PUT /api/tasks/63f2c1a8b3d5e9f1a2c3d4e5/status
POST /api/tasks/63f2c1a8b3d5e9f1a2c3d4e5/comments
PUT /api/tasks/63f2c1a8b3d5e9f1a2c3d4e5/progress
```

---

## Dashboard Endpoint
**Path:** `/dashboard`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get dashboard statistics & overview | Yes |

### Example Call:
```javascript
GET /api/dashboard
```

---

## Request/Response Format

### Request Headers (for authenticated routes)
```javascript
{
  'Content-Type': 'application/json',
  'stoken': 'jwt-token-from-login'
}
```

### Success Response
```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "pagination": { /* optional, for list endpoints */ }
}
```

### Error Response
```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```
