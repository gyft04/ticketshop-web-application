# Ticket Plan

**Deadline: 13. Juli 2026**

## Phase 1 — Backend (DONE)

| Ticket | Assigned to | Status |
|---|---|---|
| Backend API: all event routes | Lawend | ✅ Done |
| Backend API: auth (register/login/JWT) | Lawend | ✅ Done |
| Backend API: order flow + transactions | Lawend | ✅ Done |
| Database schema + seed data | Lawend | ✅ Done |
| Auth middleware (JWT protected routes) | Lawend | ✅ Done |

## Phase 2 — Frontend Pages (NOW — until 13. July)

| Ticket | Assigned to | Description |
|---|---|---|
| Event list page | Sahel | Show all events, call GET /api/events |
| Event detail page | Nadim | Show one event + ticket categories |
| Login + Register pages | Grace | Two forms, call POST /api/auth/login and /register |
| Cart + Checkout page | Sahel | Display cart, place order via POST /api/orders |
| Navigation bar + routing | Nadim | Header, links between pages, Angular routing |
| Admin page | Grace | List all events, create new event form |

## Phase 3 — Polish (final days before deadline)

| Ticket | Assigned to | Description |
|---|---|---|
| Styling all pages | Everyone | Make it look presentable with plain CSS |
| Testing + bug fixes | Everyone | Manual testing, fix issues |
| Final cleanup + README update | Lawend | Code review, documentation |

---

## API Reference (for teammates)

Base URL: `http://localhost:3000`

| Method | Route | Auth required | Description |
|---|---|---|---|
| GET | /api/events | No | List all events |
| GET | /api/events/:id | No | Single event |
| GET | /api/events/:id/tickets | No | Ticket categories for event |
| POST | /api/events | Yes | Create event |
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login, returns JWT token |
| POST | /api/orders | Yes | Place an order |
| GET | /api/orders | Yes | My orders |

**Auth header format:**
```
Authorization: Bearer <token>
```
