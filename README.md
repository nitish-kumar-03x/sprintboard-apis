# Sprintboard APIs

A robust, feature-rich backend API for a project and task management tool (Sprintboard). Built with Node.js, Express, and MySQL, this API supports Role-Based Access Control (RBAC), background job processing via BullMQ, and stateless authentication via JWT.

## Tech Stack

- **Framework:** Node.js, Express.js
- **Database:** MySQL
- **Caching & Message Queue:** Redis, BullMQ
- **Authentication:** JWT (JSON Web Tokens), bcrypt
- **File Uploads:** Multer, Cloudinary
- **Documentation:** Swagger UI

## Features

- **Role-Based Access Control:** Separate roles for `manager` and `employee`.
- **Advanced Task Management:** Create, update, assign, and track the progress of tasks and projects.
- **Background Processing:** Non-blocking email notifications sent via BullMQ workers.
- **Secure Authentication:** JWT-based stateless authentication and a secure, stateless OTP flow for password resets.
- **Profile Management:** Users can customize their themes dark/light and upload avatars directly to Cloudinary.

## Prerequisites

- **Node.js** (v22+ recommended)
- **MySQL** Server
- **Redis** Server
- **Cloudinary** Account (for image uploads)
- **Gmail Account** (or any SMTP server for sending emails)

## Installation & Setup

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/nitish-kumar-03x/sprintboard-apis.git
   cd sprintboard-apis
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Environment Variables**
   Rename `.env.example` to `.env` and fill in your credentials:
   \`\`\`env
   HOST =localhost
   PORT =8000
   DATABASE_URL ="YOUR URL"
   JWT_SECRET =SECRET KEY

   CLOUDINARY_CLOUD_NAME=SAMPLE
   CLOUDINARY_API_KEY=123456789
   CLOUDINARY_API_SECRET=SECRET

   EMAIL_USER =EMAIL
   EMAIL_PASS =APP PASSWORD
   EMAIL_SERVICE =gmail

   REDIS_URL = "YOUR URL"
   \`\`\`

4. **Initialize Database**
   Import the `schema.sql` file into your MySQL database to create the required tables.

5. **Start the server**
   \`\`\`bash
   # Development mode with hot-reloading
   npm run dev
   
   # Production mode
   npm start
   \`\`\`

## API Endpoints

The API is fully documented using Swagger. Once the server is running, you can explore and interact with all endpoints at:
**`http://localhost:3000/docs`**

### Summary of available routes:

#### Auth
- **POST** `/api/public/auth/register` - Register a new user (supports avatar upload)
- **POST** `/api/public/auth/login` - Login and receive a JWT
- **POST** `/api/public/auth/forgot-password` - Request a 6-digit OTP to your email
- **POST** `/api/public/auth/reset-password` - Reset your password using the OTP and session token

#### Users
- **GET** `/api/private/users/me` - Get the current logged-in user's profile
- **PUT** `/api/private/users/me` - Edit user profile (name, avatar)
- **GET** `/api/private/users/all-users` - Get a list of all users
- **PUT** `/api/private/users/theme` - Update user theme preference

#### Tasks
- **POST** `/api/private/tasks` - Create a new task *(Manager only)*
- **POST** `/api/private/tasks/all` - Get a paginated and filterable list of tasks
- **GET** `/api/private/tasks/:id` - Get details of a specific task
- **PUT** `/api/private/tasks/update/:id` - Master route to update task details, priority, assignee, status, and progress
- **DELETE** `/api/private/tasks/:id` - Delete a task *(Manager only)*
- **POST** `/api/private/tasks/comments` - Add a comment to a task

#### Projects
- **POST** `/api/private/projects/add` - Create a new project *(Manager only)*
- **GET** `/api/private/projects` - Get all projects
- **GET** `/api/private/projects/:id` - Get a specific project by ID
- **PUT** `/api/private/projects/:id` - Update a project *(Manager only)*
- **DELETE** `/api/private/projects/:id` - Delete a project *(Manager only)*

#### Dashboard
- **GET** `/api/private/dashboard` - Get dashboard statistics (leveraging Redis caching)

