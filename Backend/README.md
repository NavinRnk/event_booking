# Backend

This is the API for the Event & Ticket System. It handles registering/logging in users, listing and creating events, and booking/cancelling tickets. There's more background on the overall project (and why I built it the way I did) in the README at the root of the repo - this file is just the setup steps for this folder.

## Stack

- Node.js + Express + TypeScript
- MySQL with Sequelize as the ORM
- JWT for auth, bcrypt for hashing passwords

## Folders

```
Backend/
  server.ts          starts the express app
  src/
    config/          reads .env
    database/         db connection + a script that auto-creates the schema on startup
    models/            users, events, bookings, logs
    controllers/        route logic
    routes/              maps urls to controllers
    middlewares/          auth check, sanitizing input, rate limiting, error handling
    validators/            input validation rules per route
    utils/                  custom error class, async wrapper, logger
    seed.ts                 adds sample data on first run
  sql/schema.sql
  scripts/concurrency-test.js
  postman_collection.json
```

## Getting it running

You need Node 18+ and MySQL installed and running locally.

```bash
cd Backend
npm install
```

Make a `.env` file (I didn't commit an example file since it'd just have placeholder secrets in it anyway) with:

```env
PORT=5000
NODE_ENV=development

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DB=event_ticket_db

JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=1d

CORS_ORIGINS=http://localhost:5173

RATE_LIMIT_WINDOW_MIN=15
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10
```

Then:

```bash
npm run dev
```

On startup the server connects to MySQL, creates the database/tables if they aren't there yet (from `sql/schema.sql`), and seeds some sample data the first time (5 users, 5 events, 5 bookings, 5 logs). After that it just starts normally without re-seeding.

You should see something like:

```
[db] Connecting to MySQL...
[db] Database "event_ticket_db" is ready.
[seed] Tables are empty - inserting demo data...
Server running on port 5000
```

Sample accounts you can log in with:

| Role | Email | Password |
|---|---|---|
| admin | admin@example.com | Admin@123 |
| user | user@example.com | User@1234 |

Quick check it's alive: http://localhost:5000/api/health

## Endpoints

Base URL `http://localhost:5000/api`

- `POST /auth/register`, `POST /auth/login` - public
- `GET /auth/me` - needs a token
- `GET /events`, `GET /events/:id` - public
- `POST /events`, `PUT /events/:id`, `DELETE /events/:id` - admin only
- `POST /bookings`, `GET /bookings/my`, `DELETE /bookings/:id` - need a token

Protected routes expect `Authorization: Bearer <token>` from the login/register response.

Import `postman_collection.json` into Postman if you want to try these out without writing curl commands - it's ordered numerically so you know what to run first, and it saves your token automatically after login.

## Commands

- `npm run dev` - run the server (restarts on file changes)
- `npm run build` / `npm start` - compile to JS and run that instead
- `npm run seed` - seed data manually (usually not needed, happens automatically)
- `npm run test:concurrency` - fires 20 booking requests at an event with only 5 tickets, checks that exactly 5 succeed

## If something's not working

- **Port already in use** - something else is already running on 5000, either close it or change `PORT`.
- **Can't connect to the database** - make sure MySQL is actually running, and double check the `MYSQL_USER`/`MYSQL_PASSWORD` in `.env` match your local setup.
- **Missing JWT_SECRET error** - your `.env` doesn't exist or is missing that line.
