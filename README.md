# User Directory

This workspace contains a React + Vite frontend and an Express backend. The
frontend saves and displays user details through the backend; MongoDB access
and its connection string remain on the backend.

## Configure MongoDB

The backend reads `MONGODB_URI` from `backend/.env`. The local development
configuration is:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/userDB
```

`backend/.env` is ignored by Git. Do not copy MongoDB credentials or connection
strings into frontend environment files. The frontend only uses
`VITE_API_BASE_URL` to locate the API.

## Run the project

In one PowerShell terminal:

```powershell
cd backend
npm install
npm run dev
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the frontend URL printed by Vite (normally http://localhost:5173). The API
runs at http://localhost:5000.

## User API

All user routes start with `/api/users`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/users` | Return saved users, newest first. |
| POST | `/api/users` | Save a user with `name`, `email`, and `age`. |

Names and valid email addresses are required. Age must be a whole number from
0 to 120. The existing `/api/students` routes remain available; the React UI
uses only the user routes.

## Tests

Run backend API validation checks from `backend` with `npm test`. They don't
require MongoDB. Saving or retrieving users requires a MongoDB server listening
at `127.0.0.1:27017`.

## Main files

- `backend/server.js` loads environment settings, connects to MongoDB, and mounts the API routes.
- `backend/models/User.js` defines stored user fields.
- `backend/routes/users.js` validates and implements the user endpoints.
- `backend/.env.example` shows the local MongoDB configuration.
- `backend/test/api.test.js` checks API validation and error handling.
- `frontend/src/App.jsx` contains the user form, list, and API requests.
- `frontend/src/styles.css` contains the responsive page styles.
