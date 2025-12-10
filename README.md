# Team Task Board (Mini Trello)

A full-stack Kanban-style board with auth, roles, real-time updates, and drag-and-drop.

## Features
- JWT auth (register/login/logout), bcrypt password hashing.
- Roles: Admin and Member; admin can delete any task, member only their own.
- Tasks: title, description, status (`To Do` | `Doing` | `Done`), creator, last moved by/at.
- CRUD APIs with role/ownership checks.
- Real-time updates via Socket.io (create/update/delete/status-change).
- Drag-and-drop between columns; optimistic updates + socket fan-out.
- SPA frontend (Vite/React) with protected task board.

## Stack
- Backend: Node.js, Express, Mongoose, MongoDB, Socket.io.
- Frontend: React (Vite), Tailwind utility styles, @hello-pangea/dnd, Socket.io client.

## Setup
### Backend
1) Install deps: `npm install`
2) Env (`server/.env`):
```
PORT=8000
MONGODB_URL=mongodb://127.0.0.1:27017/team-task-board
JWT_SECRET=replace_me
ADMIN_EMAILS=admin@example.com
```
3) Run: `node server/server.js` (or `nodemon server/server.js`)

### Frontend
1) `cd client/teamtaskboard`
2) Install deps: `npm install`
3) Run dev server: `npm run dev -- --host` (check console for port, usually 5173/5174)
4) Env (optional) `client/teamtaskboard/.env`:
```
VITE_API_BASE=http://localhost:8000/api
```

## API (summary)
- `POST /api/auth/signup` { username, email, password } → 201
- `POST /api/auth/login` { emailOrUsername, password } → sets JWT cookie, returns { userId, role }
- `POST /api/auth/logout` → clears cookie
- `GET /api/tasks` → list all tasks (populated creator/lastMovedBy)
- `POST /api/tasks` { title, description?, status? } → create (creator = current user)
- `PATCH /api/tasks/:id` { title?, description?, status? }
  - Status-only updates allowed for any authenticated user (lastMovedBy tracked)
  - Other edits require admin or creator
- `DELETE /api/tasks/:id` → admin or creator

## Realtime (Socket.io)
- Server emits: `task:create`, `task:update`, `task:delete`
- Clients listen and update local state; auth cookie sent with `withCredentials: true`

## Drag & Drop
- Implemented with `@hello-pangea/dnd`; dropping into a column updates status and persists via API + sockets.

## Permissions
- Delete: admin any task; member only own.
- Update: status-only by any authenticated user; other edits admin/creator.

## Running Locally
1) Start MongoDB locally.
2) Start backend (`PORT=8000`).
3) Start frontend, open `http://localhost:5173` (or port shown).

## Notes
- Real-time reflects across multiple browsers; cards show creator and last moved by.
- If ports differ, update CORS origins in `server/server.js` and `VITE_API_BASE`.

