# KhanaKart Frontend (React + Vite)

This is a minimal React frontend for your Laravel API (Sanctum personal-access tokens). It includes:

- Login (POST `/api/login`) that stores the returned token
- Protected routes with `Authorization: Bearer <token>`
- Menu Items list + Admin-only create/update/delete
- Orders list + Waiter-only create, Admin/Kitchen status update
- Payment QR viewer

## 1) Prereqs

- Node.js 18+ and npm installed
- Your Laravel API running locally (e.g. `php artisan serve` on port 8000)

## 2) Configure CORS in Laravel

In `config/cors.php`, allow your Vite dev origin (http://localhost:5173), e.g.

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:5173'],
'allowed_headers' => ['*'],
'supports_credentials' => false,
```

Then clear config cache:

```bash
php artisan config:clear
```

## 3) Configure environment

Create a file named `.env.local` in this folder with:

```
VITE_API_URL=http://localhost:8000
```

If your Laravel serves on a different host/port, change it accordingly.

## 4) Install & run

```bash
npm install
npm run dev
```

Open the URL shown in the console (default http://localhost:5173).

## 5) Login / Roles

- Use the credentials for an existing user. The `/api/login` endpoint returns a token.
- The app will call `/api/dashboard` to infer your role (`admin`, `waiter`, or `kitchen`) based on the payload shape and will show/hide actions.

## 6) Where to change things

- API base: `src/api/client.js` (reads `VITE_API_URL`)
- Auth context: `src/context/AuthContext.jsx`
- Pages:
  - Dashboard: `src/pages/Dashboard.jsx`
  - Menu Items: `src/pages/MenuItems.jsx`
  - Orders: `src/pages/Orders.jsx`
  - Payment: `src/pages/Payment.jsx`

## 7) Build for production

```bash
npm run build
```

Deploy the `dist/` directory to any static hosting and point it to your API URL.