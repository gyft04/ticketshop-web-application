# Ticketshop Web Application

A full-stack web application for discovering events, selecting tickets and placing orders online.

The application was developed as a **semester team project** and implements the main workflow of a ticket platform from both the customer and organizer perspectives.

## Features

### Customer

* Browse available events
* Search and filter events
* View detailed event information
* Display event locations on an interactive map
* Select different ticket categories
* Add tickets to a shopping cart
* Complete the checkout process
* Create an account and log in
* View previous orders

### Organizer

* Organizer authentication
* Create new events
* Edit and delete existing events
* Upload event images
* Configure Standard and VIP ticket quantities and prices
* Manage published events
* Access a public organizer shop page

## Tech Stack

### Frontend

* Angular 21
* TypeScript
* Angular Signals
* Angular Router
* Reactive / template-driven forms
* Leaflet
* OpenStreetMap
* HTML
* CSS

### Backend

* Node.js
* Express.js
* REST API
* JWT authentication
* bcryptjs
* Multer

### Database

* MySQL
* mysql2
* Raw SQL

## Architecture

The application follows a classic three-layer architecture:

```text
Angular Frontend
       |
       | HTTP / REST
       v
Node.js + Express Backend
       |
       | SQL
       v
     MySQL
```

The frontend communicates with the Express REST API.
The backend contains the application logic, authentication, authorization and database access.

## Authentication and Authorization

Users can register and log in through the application.

Passwords are hashed using `bcryptjs`, while authentication is handled using JSON Web Tokens (JWT).

Protected routes use authentication middleware, and role-based authorization separates customer functionality from organizer functionality.

## Ticket Ordering

Customers can select tickets and add them to their cart.

During checkout, the backend verifies ticket availability before creating the order. The corresponding ticket stock is then updated in the database.

This prevents orders from being created with unavailable ticket quantities.

## Project Structure

```text
ticketshop-web-application/
│
├── frontend/
│   └── src/
│       └── app/
│           ├── components/
│           ├── guards/
│           ├── pages/
│           └── services/
│
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   │
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── db.js
│       └── server.js
│
├── docs/
├── .gitignore
└── README.md
```

## My Contribution

This application was developed collaboratively as a semester project.

My main responsibilities included:

* Development of the **Login interface**
* Development of the **Registration interface**
* Development of the **Admin / Organizer interface**
* Integration of the corresponding frontend forms with the application logic
* UI styling and usability improvements
* Participation in application testing and bug fixing

The project also gave me practical experience working with an existing frontend/backend architecture and integrating my work into a shared Git-based development workflow.

## Installation

### Prerequisites

Make sure the following tools are installed:

* Node.js
* npm
* Angular CLI
* MySQL Server

### 1. Clone the repository

```bash
git clone https://github.com/gyft04/ticketshop-web-application.git
cd ticketshop-web-application
```

### 2. Configure the database

Create the MySQL database:

```sql
CREATE DATABASE ticketshop;
USE ticketshop;
```

Then execute:

```text
backend/database/schema.sql
backend/database/seed.sql
```

### 3. Configure the backend environment

Inside the `backend` directory, copy:

```text
.env.example
```

to:

```text
.env
```

Then configure your own local values.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ticketshop
JWT_SECRET=your_secret
```

The real `.env` file is excluded from Git.

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

## Run the Application

### Backend

From the `backend` directory:

```bash
node src/server.js
```

The API runs locally on:

```text
http://localhost:3000
```

### Frontend

From the `frontend` directory:

```bash
npm start
```

The Angular application runs locally on:

```text
http://localhost:4200
```

## Main Concepts Practiced

Through this project, I worked with and strengthened my understanding of:

* Full-stack web application architecture
* Frontend/backend communication through REST APIs
* Angular components and services
* Angular routing
* Forms and user authentication
* JWT-based authentication
* Role-based access control
* Relational database integration
* SQL queries
* Shopping cart and ordering workflows
* Git-based collaborative development

## Project Context

University semester project developed collaboratively as part of practical software development coursework.

The repository is presented here as part of my software development portfolio.
