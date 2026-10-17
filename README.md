# Restaurant App MVP (A2 — Server and Database)

React Native (Expo) restaurant app connected to a Node.js/Express API and MongoDB. Menu, users, orders, and reservations are shared across devices instead of mock files.

## Run the server

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```
PORT=5000
MONGO_URI=mongodb+srv://USER:PASSWORD@HOST/restaurant_app
JWT_SECRET=replace-with-a-long-random-string
```

Create a MongoDB database named `restaurant_app` (Atlas or local). On Atlas, allow your current IP under Network Access.

```bash
npm run seed
npm run dev
```

`GET http://localhost:5000/api/health` should return `{ "status": "ok", "time": "..." }`.

## Run the app

```bash
npm install
npx expo start
```

Change **BASE_URL in one place**: `src/api/client.js`.

- Physical phone: `http://YOUR_LAPTOP_LAN_IP:5000/api` (same Wi-Fi as the laptop)
- Android emulator: `http://10.0.2.2:5000/api`
- Web / iOS simulator: `http://localhost:5000/api` (already used when `Platform.OS === "web"`)

If you see **Network request failed**, the server is not reachable at BASE_URL. Laptop IP can change; update it when that happens.

## Seeded login accounts

| Role | Email | Password |
| --- | --- | --- |
| Customer | customer@test.com | password123 |
| Manager | manager@test.com | password123 |

Password rule: at least 8 characters and one digit.

## API endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | /api/health | Public |
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/menu | Public (query: category, search) |
| GET | /api/menu/:id | Public |
| POST | /api/menu | Manager |
| PUT | /api/menu/:id | Manager |
| DELETE | /api/menu/:id | Manager |
| POST | /api/orders | Logged-in |
| GET | /api/orders/my | Logged-in |
| GET | /api/orders | Manager |
| PATCH | /api/orders/:id/status | Manager |
| GET | /api/reservations/tables | Public |
| POST | /api/reservations | Logged-in |
| GET | /api/reservations/my | Logged-in |
| GET | /api/reservations | Manager |
| PATCH | /api/reservations/:id | Manager |
| PATCH | /api/reservations/:id/cancel | Owner |

Postman collection: `A2/restaurant-api.postman_collection.json`

## A2 folder

- `A2/SRS_v2.pdf` — updated SRS
- `A2/SRS_v2.md` — source text
- `A2/diagrams/` — sequence and deployment diagrams
- `A2/restaurant-api.postman_collection.json`
- `A2/screenshots/` — API and two-device evidence

## Two-device test

1. Start the server (`npm run dev` in `server`).
2. Log in as manager on device A and as customer on device B.
3. Manager: change a menu price, then pull-to-refresh the customer menu.
4. Customer: place an order and book a table.
5. Manager: accept the booking and mark the order Ready.
6. Customer Orders/Reservations tabs update without restarting (orders poll every 10 seconds).

## Demo video

- **Two-device screen recording (max 4 minutes):** _Add your Drive/YouTube link here after recording._

## Repo layout

- `server/` — Express API (config, models, routes, controllers, middleware)
- `src/` — Expo app (screens, context, reducers, hooks, `src/api/client.js`)
- Do not commit `server/.env`. Only `server/.env.example` is in git.
