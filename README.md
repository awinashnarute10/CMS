# Kloudspot CMS

A React dashboard for monitoring site occupancy, footfall, dwell time, demographics, and crowd entry and exit activity.

## Features

- Email and password authentication with protected routes
- Site selection and live analytics overview
- Occupancy, footfall, dwell-time, and demographics charts
- Searchable, filterable, paginated crowd entry and exit records
- Optional Socket.IO connection for live updates
- Light and dark themes

## Requirements

- Node.js 20 or later
- npm

## Getting started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Vite prints the local URL after the server starts.

## Configuration

Create a `.env` file in the project root only when you need to override the defaults:

```dotenv
VITE_BASE_URL=https://your-api.example.com/api
VITE_SOCKET_URL=https://your-socket.example.com
```

`VITE_BASE_URL` defaults to `https://hiring-dev.internal.kloudspot.com/api`. When `VITE_SOCKET_URL` is not set, the Socket.IO URL is derived from the API URL's origin.

Do not commit `.env` files because they may contain environment-specific values.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm test` | Run the Vitest test suite once. |

## Application routes

| Route | Purpose |
| --- | --- |
| `/login` | Sign in to the dashboard. |
| `/overview` | View site analytics and charts. |
| `/crowd-entries` | Browse crowd entry and exit records. |

All dashboard routes require authentication.

## Project structure

```text
src/
  api/          API and Socket.IO clients
  components/   Reusable UI, chart, and layout components
  context/      Authentication, site, theme, and socket providers
  hooks/        Data-fetching and application hooks
  pages/        Route-level pages
  __tests__/    Vitest test suite
```

## Deployment

Run `npm run build` and deploy the generated `dist/` directory to a static host. The included `public/_redirects` file configures single-page-app routing for hosts that support that convention.
