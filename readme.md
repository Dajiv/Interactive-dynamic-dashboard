# Interactive Dynamic Task Dashboard

A full-stack web application designed to manage tasks efficiently through an interactive and responsive dashboard.

## 🚀 Project Overview

The Interactive Dynamic Task Dashboard is built to simplify task management by allowing users to create, view, update, and delete tasks. It uses a React frontend, a Node.js and Express backend, and a MySQL database for persistent data storage.

## ✨ Features

- Create, view, update, and delete tasks (CRUD operations)
- Manage task status: Pending, In Progress, and Completed
- Set task priorities: Low, Medium, and High
- Assign due dates to tasks
- Search and filter tasks
- Store task data in a MySQL database
- Communicate with the backend through REST APIs
- Responsive user interface

## 🛠️ Technologies Used

**Frontend**
- React
- Vite
- JavaScript
- HTML5
- CSS3

**Backend**
- Node.js
- Express.js
- REST API
- MySQL2

**Database**
- MySQL

**Development Tools**
- Visual Studio Code
- Git and GitHub
- Thunder Client

## 📁 Project Structure

```text
Interactive-dynamic-dashboard/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── taskroutes.js
│   │   ├── db.js
│   │   └── server.js
│   ├── schema.sql
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskCard.jsx
│   │   │   └── TaskForm.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Node.js and npm
- MySQL Server
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Dajiv/Interactive-dynamic-dashboard.git
cd Interactive-dynamic-dashboard
```

### 2. Configure the Database

Create a MySQL database named `dashboard`.

Run the SQL statements in `backend/schema.sql` using MySQL Workbench or another MySQL client.

### 3. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory using `.env.example` as a template. Configure your MySQL connection details and backend port.

Example configuration:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=dashboard
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 4. Configure the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API status |
| GET | `/api/db-test` | Check database connectivity |
| GET | `/api/tasks` | Retrieve tasks |
| POST | `/api/tasks` | Create a task |

Additional endpoints can be documented here as update and delete functionality is implemented and verified.

## 🎯 Project Objective

This project demonstrates full-stack development concepts, REST API integration, asynchronous JavaScript, database connectivity, and CRUD operations using modern web technologies.

## 👨‍💻 Developer

**Dajiv Uthayakumar**

GitHub: [@Dajiv](https://github.com/Dajiv)

---

If you find this project useful, feel free to explore the repository and share feedback.