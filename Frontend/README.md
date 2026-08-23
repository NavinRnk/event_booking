# Frontend

A small React app for the Event & Ticket System - browse events, log in, book/cancel tickets, and if you're an admin, create new events. It's mainly there so I could test the backend from an actual UI instead of just Postman. The root README has more context on the project as a whole.

## Stack

React + TypeScript + Vite, react-router for navigation, axios for API calls, Sass for styling.

## Folders

```
Frontend/src/
  main.tsx, App.tsx     app entry + layout
  api/client.ts          axios instance, attaches the login token to every request automatically
  context/AuthContext.tsx    keeps track of who's logged in
  routes/                     page list + which ones need login/admin
  components/
    layout/Navbar.tsx
    ProtectedRoute.tsx          redirects to login if you're not allowed on a page
    common/                      shared bits: buttons, inputs, alerts, etc.
  pages/                          one file per page (Events, Login, Register, MyTickets, CreateEvent, NotFound)
  styles/                          scss files
```

## Getting it running

Needs Node 18+. The backend has to be running too, otherwise there's nothing to show.

```bash
cd Frontend
npm install
```

Make a `.env` file in this folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Then:

```bash
npm run dev
```

Opens at http://localhost:5173. The backend's `CORS_ORIGINS` needs to match this address exactly (including the port) or the browser will block the requests.

## Pages

| Page | Route | Access |
|---|---|---|
| Events | `/` | anyone, booking needs login |
| Login | `/login` | logged out only |
| Register | `/register` | logged out only |
| My Tickets | `/my-tickets` | logged in |
| Create Event | `/admin/create-event` | admin only |

Test accounts (from the backend's seed data):

- admin@example.com / Admin@123
- user@example.com / User@1234

## How auth works here

After logging in, the backend gives back a token, which gets saved in `localStorage`. Every request after that has the token attached automatically (see `api/client.ts`). If the token expires or is invalid, the API returns 401 and the app clears the saved login and sends you back to `/login`.

Worth noting: hiding a page for someone who isn't logged in (like `/my-tickets`) is just a UI nicety - the actual security check happens on the backend, which verifies the token independently regardless of what the frontend shows or hides.

## Commands

- `npm run dev` - dev server with hot reload
- `npm run build` - production build into `dist/`
- `npm run preview` - preview the production build locally

## If something's not working

- **Events page is empty / shows an error** - the backend probably isn't running yet.
- **CORS error in the console** - the backend's `CORS_ORIGINS` doesn't match the URL you're opening the frontend on.
- **Keeps redirecting to login even after logging in** - clear `localStorage` (dev tools -> Application -> Local Storage) and log in again, might be a stale token from earlier testing.
