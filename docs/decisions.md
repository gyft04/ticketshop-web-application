# Project Decisions

## Roles

| Role | Key Permissions |
|---|---|
| Guest | Browse, search, view events, register |
| User | Login, buy tickets, view orders, download invoice |
| Organizer | Create/edit/cancel own events, manage ticket categories, view own stats |
| Admin | Manage all users, all events, platform-wide stats |

---

## Data Model Decisions

### Price belongs to Ticket Category, NOT to Event
An event has multiple ticket categories (e.g. VIP, Standard, Early Bird).
Each category has its own price and available quantity.
- Event = general info (title, date, location, etc.)
- Ticket Category = name, price, quantity_available, quantity_sold

---

## Core Entities & Relationships

| Entity | Relationships |
|---|---|
| `user` | has many `orders`, has many `events` (as organizer) |
| `event` | belongs to `user` (organizer), has many `ticket_categories` |
| `ticket_category` | belongs to `event`, appears in many `order_items` |
| `order` | belongs to `user`, has many `order_items` |
| `order_item` | belongs to `order`, belongs to `ticket_category` |

---

## Event Fields
title, description, start_date, start_time, end_date, end_time,
location, category, image, status (draft/published/cancelled),
organizer_id, created_at


## DBMS
Relational DB and NoSQL DB
