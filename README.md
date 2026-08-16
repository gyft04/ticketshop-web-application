# Ticketshop

A full-stack web application for browsing events and buying tickets.
Built as a semester project.

**Deadline: 13. July 2026**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21 (Standalone Components, Signals) |
| Backend | Node.js + Express |
| Database | MySQL |
| DB Access | mysql2 (raw SQL, no ORM) |
| Styling | Plain CSS |

---

## Prerequisites

Make sure you have these installed:

- **Node.js** (v18 or higher) — https://nodejs.org
- **Angular CLI** — `npm install -g @angular/cli`
- **MySQL Server** (v8.0)

Check your versions:
```
node -v
npm -v
ng version
```

---

## Setup — Do This Once

### 1. Clone the repository
```
git clone https://github.com/LelouchLaw/ticketshop.git
cd ticketshop
```

### 2. Database setup
Open MySQL and run:
```sql
CREATE DATABASE ticketshop;
USE ticketshop;
SOURCE backend/database/schema.sql;
SOURCE backend/database/seed.sql;
```

### 3. Install backend dependencies
```
cd backend
npm install
```

### 4. Install frontend dependencies
```
cd frontend
npm install
```

---

## How to Run

You need **two terminals open at the same time**.

**Terminal 1 — Backend:**
```
cd backend
node src/server.js
```
Backend runs at: http://localhost:3000

**Terminal 2 — Frontend:**
```
cd frontend
ng serve
```
Frontend runs at: http://localhost:4200

---

## Project Structure

```
Ticketshop/
├── backend/
│   ├── database/
│   │   ├── schema.sql          # Table definitions
│   │   └── seed.sql            # Test data
│   └── src/
│       ├── server.js           # Express server
│       ├── db.js               # MySQL connection
│       ├── routes/
│       │   ├── events.js
│       │   ├── auth.js
│       │   └── orders.js
│       ├── controllers/
│       │   ├── eventsController.js
│       │   ├── authController.js
│       │   └── ordersController.js
│       └── middleware/
│           └── auth.js         # JWT middleware
└── frontend/
    └── src/app/
        ├── pages/
        │   ├── events/         # Event list page
        │   ├── event-detail/   # Event detail + ticket selection
        │   ├── login/          # Login form
        │   ├── register/       # Register form
        │   ├── cart/           # Cart + checkout
        │   └── admin/          # Create event form
        ├── components/
        │   └── navbar/         # Navigation bar
        └── services/
            ├── events.ts       # API calls for events
            ├── auth.ts         # Login, register, token
            ├── orders.ts       # Place orders
            └── cart.ts         # Cart state (global)
```

---

## API Endpoints

Base URL: `http://localhost:3000`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | /api/events | No | List all events |
| GET | /api/events/:id | No | Single event |
| GET | /api/events/:id/tickets | No | Ticket categories |
| POST | /api/events | Yes | Create event |
| POST | /api/auth/register | No | Register |
| POST | /api/auth/login | No | Login → returns token |
| POST | /api/orders | Yes | Place order |
| GET | /api/orders | Yes | My orders |

**Auth header format:**
```
Authorization: Bearer <token>
```

---

## Tasks — Who Does What

### Sahel — Event List Page + Cart Page
**Files to edit:**
- `frontend/src/app/pages/events/events.html`
- `frontend/src/app/pages/events/events.css`
- `frontend/src/app/pages/cart/cart.html`
- `frontend/src/app/pages/cart/cart.css`

**What to do:**
1. Style the event list — make each event a nice card with title, location, date, and a "Details" button
2. Style the cart page — show items clearly with price, quantity, total, and a "Place Order" button
3. The logic is already implemented — you only need to add CSS and improve the HTML layout

**Hint:** Look at `events.html` to see how events are already displayed with `@for`.

---

### Nadim — Event Detail Page + Navbar
**Files to edit:**
- `frontend/src/app/pages/event-detail/event-detail.html`
- `frontend/src/app/pages/event-detail/event-detail.css`
- `frontend/src/app/components/navbar/navbar.html`
- `frontend/src/app/components/navbar/navbar.css`

**What to do:**
1. Style the event detail page — show event info on the left, ticket selector on the right (like the Light project)
2. The +/- ticket buttons are already working — just make them look good
3. Style the navbar — make it look like a real navigation bar with proper spacing and colors

**Hint:** The ticket counter buttons already work with `(click)="increase(ticket.id)"` and `(click)="decrease(ticket.id)"`.

---

### Grace — Login + Register Pages + Admin Page
**Files to edit:**
- `frontend/src/app/pages/login/login.html`
- `frontend/src/app/pages/login/login.css`
- `frontend/src/app/pages/register/register.html`
- `frontend/src/app/pages/register/register.css`
- `frontend/src/app/pages/admin/admin.html`
- `frontend/src/app/pages/admin/admin.css`

**What to do:**
1. Style the login form — centered on the page, clean and simple
2. Style the register form — same style as login
3. Style the admin page — a form to create a new event, all fields are already there

**Hint:** The forms already work — `(ngSubmit)="onSubmit()"` is connected. You only need to style them.

---

## Important Angular Notes for Everyone

### Signals — How to read data in templates
In this project we use Angular Signals. To show data in HTML you write `{{ value() }}` with parentheses:

```html
<!-- Correct -->
{{ eventData().title }}
{{ events().length }}

<!-- Wrong — no parentheses -->
{{ eventData.title }}
```

### How to bind CSS classes
```html
<button [class.active]="isActive">Click</button>
```

### How to loop over a list
```html
@for (item of items(); track item.id) {
  <div>{{ item.title }}</div>
}
```

### How to show/hide something
```html
@if (errorMessage()) {
  <p>{{ errorMessage() }}</p>
}
```

---

## Git Workflow

**Rule: Nobody pushes directly to `main`.**

### Steps for every task:

1. Make sure you are on `main` and up to date:
```
git checkout main
git pull
```

2. Create a new branch for your task:
```
git checkout -b feature/your-task-name
```

3. Work on your code. When done, commit:
```
git add .
git commit -m "Short description of what you did"
```

4. Push your branch:
```
git push -u origin feature/your-task-name
```

5. Open a **Pull Request** on GitHub and tell Lawend.

### Branch naming:
- `feature/event-list-styling` — new feature or styling
- `fix/login-error-message` — bug fix

### Rules:
- Always `git pull` before creating a new branch
- Never commit directly to `main`
- One branch per task
