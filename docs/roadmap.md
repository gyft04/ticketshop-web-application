# Ticket Shop — Roadmap

## Done — Backend Foundation
- [x] Requirements and roles defined
- [x] ER model and relationships
- [x] Database schema (5 tables with foreign keys)
- [x] Database created in MySQL
- [x] Backend project initialized (Node.js + Express)
- [x] Database connection (mysql2 pool)
- [x] Seed data (5 events + 10 ticket categories)
- [x] .env for secrets (JWT, DB credentials)

## Done — Backend Structure
- [x] src/routes/events.js
- [x] src/controllers/eventsController.js
- [x] src/routes/auth.js
- [x] src/controllers/authController.js
- [x] src/routes/orders.js
- [x] src/controllers/ordersController.js
- [x] src/middleware/auth.js (JWT middleware)
- [x] src/middleware/requireRole.js (role-based access)

## Done — Backend API Routes
- [x] GET  /api/events
- [x] GET  /api/events/:id
- [x] GET  /api/events/:id/tickets
- [x] POST /api/events (organizer/admin only)
- [x] POST /api/auth/register
- [x] POST /api/auth/login
- [x] POST /api/orders (protected, transaction, stock check)
- [x] GET  /api/orders (protected)

## Done — Frontend
- [x] Angular 21 project with standalone components + signals
- [x] Routing (events, event-detail, login, register, cart, admin)
- [x] Navbar with cart badge
- [x] EventsService, AuthService, OrdersService, CartService
- [x] Events list page
- [x] Event detail page with ticket selector (+/- buttons)
- [x] Login page
- [x] Register page
- [x] Cart page with order placement
- [x] Admin page (create event form)
- [x] CSS — consistent design across all pages

## Remaining (nice to have)
- [ ] GET /api/orders/:id — single order detail
- [ ] Image upload
- [ ] Statistics page
- [ ] Invoices / PDFs
- [ ] WebSockets (optional)
