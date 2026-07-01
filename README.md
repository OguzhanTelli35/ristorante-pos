# Ristorante POS

Professional restaurant POS (Point of Sale) system built with a modern, cross-platform architecture.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | SQLite (dev) / PostgreSQL (production) |
| **Desktop** | Electron |
| **State** | Zustand + TanStack React Query |

## Project Structure

```
ristorante/
├── shared/          # Types, constants, utils, validators (zero dependencies)
├── backend/         # Express REST API server
├── frontend/        # React + Vite web app + Electron desktop
└── package.json     # Monorepo root (npm workspaces)
```

## Quick Start

```bash
# Install all dependencies
npm install

# Start both backend + frontend in development
npm run dev
```

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

## Development Commands

```bash
# Start backend only
npm run dev -w backend

# Start frontend only
npm run dev -w frontend

# Reset database (clear + re-seed)
npm run db:reset -w backend

# Type check all packages
npm run typecheck
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/menu` | Get all menu categories with items |
| GET | `/api/orders` | List orders (query: destination, status, table) |
| GET | `/api/orders/:id` | Get order by ID |
| POST | `/api/orders` | Create new order |
| PATCH | `/api/orders/:orderId/items/:itemId/status` | Update item status |
| DELETE | `/api/orders/all` | Clear all orders and tables |
| GET | `/api/tables` | List open table accounts |
| GET | `/api/tables/:tableNumber` | Get table account details |
| POST | `/api/tables/:tableNumber/pay` | Mark table as paid |
| POST | `/api/tables/:tableNumber/close` | Close table account |

## Features

- **Waiter View**: Take orders with item customization, ingredient editing, notes
- **Kitchen Display**: Real-time food ticket queue with status controls
- **Bar Display**: Real-time drink ticket queue with status controls
- **Manager / Cashier**: Table accounts, payment tracking, order history
- **Responsive**: Desktop multi-panel, tablet, and phone layouts
- **Real-time**: 3-second polling for live updates across all stations

## Architecture

The codebase is designed for future expansion:
- **Shared package** enables React Native mobile app reuse
- **SQLite → PostgreSQL** switch via configuration
- **Electron** for desktop packaging (Windows, macOS, Linux)
- **WebSocket-ready** backend architecture
