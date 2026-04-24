# Inventory Management System - Frontend

A React-based frontend for the Inventory Management System. It provides a clean UI for managing products, inventory, orders, and analytics while connecting to a Spring Boot backend.

Supports role-based dashboards for ADMIN and USER accounts.

---

## Features

- **Authentication UI** — Login system connected to backend  
- **Role-Based Dashboard** — Different views for admin and user  
- **Product Management UI** — View and manage products  
- **Inventory Tracking** — Real-time stock visibility  
- **Order System** — Create and track orders  
- **Sales Dashboard** — Charts and analytics  
- **Low-Stock Alerts** — Visual warnings for inventory levels  
- **Search & Filtering** — Product search functionality  

---

## Tech Stack

- React 19  
- Vite  
- React Router DOM  
- Axios  
- Recharts  

---

## User Stories

- As an admin, I want to view a dashboard with inventory stats.  
- As a user, I want to browse products easily.  
- As a user, I want to place orders through the UI.  
- As an admin, I want to manage products visually.  
- As an admin, I want to see low-stock alerts.  
- As an admin, I want to view sales reports.  
- As a user, I want to view order history.  
- As a user, I want secure login access.  
- As an admin, I want role-based UI restrictions.  
- As a user, I want search and filtering for products.  

---

## Prerequisites

- Node.js 18+  
- Backend running at http://localhost:8081  

---

## Setup Instructions

Install dependencies:

npm install

---

## Configure API

Update `src/api/axios.js`:

const API = axios.create({
  baseURL: "http://localhost:8081/api",
});

---

## Running the Frontend

Start development server:

npm run dev

Frontend runs at:
http://localhost:5173

---

## Project Structure

api/ → API requests  
components/ → Reusable UI components  
context/ → Authentication state  
pages/ → Application screens  

---

## Pages

- Login  
- Dashboard  
- Products  
- Inventory  
- Orders  
- Suppliers  
- Categories  
- Sales Report  

---

## Role Permissions

ADMIN:
- Full access to all features  
- Manage products, inventory, suppliers  
- View analytics and reports  

USER:
- View products  
- Place orders  
- View personal order history  

---

## Common Issues

- Backend not connecting → check port 8081  
- Blank page → reinstall dependencies  
- API errors → verify axios baseURL  

---

## Future Improvements

- Mobile responsive UI  
- Better loading/error states  
- Dark mode support  
- Improved UI/UX design  
- Stronger route protection  
