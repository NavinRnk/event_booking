# Event & Ticket System

This is my submission for Backend Assessment 1. It's a REST API for managing events and ticket bookings, plus a small React frontend so I could actually test the API from a browser instead of only using Postman.

## About the database choice

The original brief asked for two databases - MySQL for users/bookings and MongoDB for events/logs. I decided to build everything on MySQL instead, mainly because I haven't worked with MongoDB before and didn't want to learn it under a deadline and end up with a shaky implementation. I felt more confident doing a solid job with one database I know well than a half-working job with two.

It also turned out to fit the booking problem nicely. A booking needs to reduce the ticket count and insert a booking row at the same time, and having both tables in the same MySQL database means I could wrap both writes in a single transaction. If anything fails, both changes roll back together. That would have been a lot more awkward across two different databases.

I explain this more in the "Why I made these choices" section below.

## Tech stack

- Backend: Node.js, Express, TypeScript
- Database: MySQL (using Sequelize as the ORM) - one schema for users, events, bookings, logs
- Auth: JWT for login sessions, bcrypt for password hashing
- Frontend: React, TypeScript, Vite, axios, react-router

## Project layout

```
Task/
  Backend/
    server.ts              entry point, sets up express and starts the server
    src/
      config/env.ts        reads .env, this is the only file that touches process.env
      database/            sequelize connection + a script that auto-creates the DB/tables
      models/               one file per table (users, events, bookings, logs)
      controllers/          the actual route logic
      routes/                maps URLs to controllers
      middlewares/           auth check, input sanitizing, rate limiting, error handler
      validators/             express-validator rules for each route
      utils/                  small helpers (custom error class, async wrapper, logger)
      seed.ts                 fills the DB with sample data on first run
    sql/schema.sql           the table definitions
    scripts/concurrency-test.js   proves tickets can't be oversold
    postman_collection.json
  Frontend/
    a React app to browse events, log in, book/cancel tickets, and (as admin) add events
```

## How I organized the backend code

Every route follows the same path: `route -> validator -> auth middleware -> controller -> model`. The routes file just wires things up, the validators hold all the input rules, and the controllers have the actual business logic. I did this so it's easy to find where any given piece of logic lives instead of it being scattered.

A couple of things worth mentioning if you're reading through the code:

**Auth is checked globally, not per-route.** There's one `verifyToken` middleware applied to every request in `server.ts`, and it only skips checking the token for routes explicitly listed as public (register, login, health check, browsing events). I did it this way so that if I ever add a new route and forget to protect it, it's locked by default instead of accidentally being open to anyone.

**Models use `hasMany` only on the parent side.** So `events` can `include` its `bookings`, but not the other way around. This meant `GET /bookings/my` (a user's own bookings) can't just do one query with a join up to `events` - I had to fetch the bookings page first, then grab the referenced events in a second query. Still just 2 queries total either way, not one per booking.

**Soft deletes everywhere.** Deleting an event doesn't actually delete the row, it just sets `is_deleted = true`. This way old bookings still show a valid event when you look them up later, instead of pointing at nothing.

## Setup

You'll need Node.js 18+ and MySQL installed and running.

### Backend

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` folder (there's no template file, just make a new one) with:

```env
PORT=5000
NODE_ENV=development

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DB=event_ticket_db

JWT_SECRET=some_long_random_string_here
JWT_EXPIRES_IN=1d

CORS_ORIGINS=http://localhost:5173

RATE_LIMIT_WINDOW_MIN=15
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10
```

Then just run:

```bash
npm run dev
```

I made the server automatically create the database and tables on startup (running `sql/schema.sql` internally) if they don't already exist, and it also seeds some sample data the first time - 5 users, 5 events, 5 bookings, 5 logs - so you're not staring at an empty app. This only happens once; if the data is already there it skips seeding.

Two of the seeded accounts you can log in with:

- admin@example.com / Admin@123 (admin)
- user@example.com / User@1234 (normal user)

Check it worked: http://localhost:5000/api/health

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Opens at http://localhost:5173. That has to match whatever's in the backend's `CORS_ORIGINS`, otherwise the browser blocks the requests.

## API overview

Base URL: `http://localhost:5000/api`

All responses look like `{ success: true/false, message, data }` (or `errors` on validation failures). Protected routes need `Authorization: Bearer <token>`.

**Auth**
- `POST /auth/register` - public
- `POST /auth/login` - public
- `GET /auth/me` - needs a token

**Events**
- `GET /events` - public, supports `page`, `limit`, `search`, `upcomingOnly`
- `GET /events/:id` - public
- `POST /events` - admin only
- `PUT /events/:id` - admin only (can't change `total_tickets` once it's set, to avoid messing up the availability count)
- `DELETE /events/:id` - admin only, soft delete, blocked if the event already has bookings

**Bookings** (all need a token)
- `POST /bookings` - body is `{ event_id, quantity }`, quantity 1-10
- `GET /bookings/my` - your own bookings
- `DELETE /bookings/:id` - cancel a booking and give the tickets back

Status codes: 200/201 success, 400 bad input, 401 not logged in / bad token, 403 wrong role, 404 not found, 409 conflict (sold out, duplicate email, already cancelled), 422 validation error, 429 too many requests, 500 server error.

There's a Postman collection at `Backend/postman_collection.json` you can import - it's numbered in the order you should run the requests, and it saves the login token and IDs automatically so you don't have to copy-paste anything between requests.

## Why I made these choices

**Everything in one MySQL database.** Like I mentioned above, this was partly about not being confident with MongoDB, but it also genuinely helped with the booking logic - decrementing the ticket count and creating the booking record happen in one database transaction, so they either both succeed or both fail. No situation where a ticket gets reserved but the booking never gets recorded, or vice versa.

**JSON column for event metadata instead of a document DB.** Events needed some flexible, schema-less fields (speakers, tags, whatever), which is normally where Mongo would shine. I used a MySQL `JSON` column for `events.metadata` instead. It's not as good for querying inside that data compared to Mongo, but for just storing and returning free-form details it works fine and I didn't need anything more advanced than that for this project.

**Preventing overselling tickets.** This was the trickiest part. If I just read the ticket count, check if there's enough, then write the new count, two people booking the last ticket at the same time could both pass the check before either one writes - and now the event is oversold. Instead I let MySQL do the check-and-subtract as one atomic statement:

```sql
UPDATE events
   SET available_tickets = available_tickets - :qty
 WHERE event_id = :id AND available_tickets >= :qty;
```

If nothing matches the WHERE clause (not enough tickets left), the update affects 0 rows, and I turn that into a 409 error. There's a script at `Backend/scripts/concurrency-test.js` that fires 20 booking requests at the same event (only 5 tickets available) at the same time, and it confirms only 5 succeed and the counter never goes negative. Run it with:

```bash
npm run test:concurrency
```

**Denormalized event title on bookings.** Each booking stores a copy of the event title at booking time, so if an admin renames the event later, old bookings still show a sensible name instead of breaking.

## Security stuff I added

- Input sanitizing on every request (escapes HTML to avoid XSS, and strips `__proto__`/`constructor`/`prototype` keys since `metadata` accepts raw client JSON)
- `express-validator` on every route for proper input validation
- Sequelize uses parameterized queries everywhere, so no SQL injection
- CORS locked to a specific origin
- Passwords are hashed with bcrypt and excluded from query results by default
- Rate limiting - especially strict on login/register to slow down brute-force attempts
- One global error handler so errors always come back in the same shape, and the server doesn't crash on an unexpected error
