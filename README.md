## API Endpoints

### Auth
- **POST** `/api/public/auth/register` - Register user (multipart/form-data for avatar).
- **POST** `/api/public/auth/login` - Login user and receive a JWT.

### Users
- **GET** `/api/private/users/me` - Get the current logged-in user's profile.
- **GET** `/api/private/users/all-users` - Get a list of all users.

### Tasks (CRUD & Management)
- **POST** `/api/private/tasks` - Create a new task *(Manager only)*.
- **POST** `/api/private/tasks/all` - Get all tasks.
- **GET** `/api/private/tasks/:id` - Get a specific task by its ID.
- **PUT** `/api/private/tasks/update/:id` - Update a task's details *(Manager only)*.
- **DELETE** `/api/private/tasks/:id` - Delete a task *(Manager only)*.
- **POST** `/api/private/tasks/assign` - Assign a task to a user *(Manager only)*.
- **PUT** `/api/private/tasks/reassign` - Reassign a task to another user *(Manager only)*.
- **PUT** `/api/private/tasks/status` - Update the status of a task.
- **POST** `/api/private/tasks/comments` - Add a comment to a task.
- **PUT** `/api/private/tasks/progress` - Update task progress *(Employee only)*.

### Dashboard
- **GET** `/api/private/dashboard` - Get dashboard statistics for the user.
