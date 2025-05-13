# Antiquitas Marketplace – Microservice Architecture (Group Member 2 Contribution)

## ✅ Overview

This repo is part of a microservice-based full-stack e-commerce project **Antiquitas Marketplace**.

🔧 This section documents the work done by **Group Member 2**, focused on:

- 🟩 Primary Data Service (SQL + Business Logic)
- 🟩 Secondary Data Service (Reviews + MongoDB + Redis Cache)
- 🧾 Swagger API Documentation

---

## 🏗️ Microservices Overview

| Service                  | Port  | Database   | Description                                |
|--------------------------|-------|------------|--------------------------------------------|
| Primary Data Service     | 5001  | MySQL      | Core product/order logic with REST APIs    |
| Secondary Data Service   | 5002  | MongoDB    | Product review handling + Redis caching    |
| Authentication Service   | TBD   | TBD        | (To be implemented by teammate)            |

---

## 📦 Primary Service (MySQL)

### 🔧 Features
- CRUD operations for products, users, orders
- Business logic for cart, wishlist, payments
- RESTful APIs
- MySQL database connection

### 🔗 Runs on: `http://localhost:5001`

---

## 💬 Secondary Service (MongoDB + Redis)

### 🔧 Features
- Create/update/delete product reviews
- Get reviews by user or product
- Caching with Redis (`GET /product/:id`)
- MongoDB integration

### 🔗 Runs on: `http://localhost:5002`

---

## ⚡ Redis Caching (Secondary Service)

- Redis stores reviews for fast access
- `GET /api/reviews/product/:id` is cached for 5 minutes
- Cache auto-clears on new review/update/delete

---

## 📘 API Documentation (Swagger)

- Swagger UI for Review Service is available at:  
  👉 `http://localhost:5002/api-docs`

---

## ▶️ How to Run (Your Part Only)

### 🛠️ Step 1: MySQL Setup
Create the database using:
```sql
CREATE DATABASE antiquitas_db;
```

### 🛠️ Step 2: MongoDB
Make sure MongoDB is running on default port (`27017`)

### 🛠️ Step 3: Redis
Run Redis via:
```bash
redis-server
```
or using Docker:
```bash
docker run -d -p 6379:6379 --name redis redis
```

### 🛠️ Step 4: Start Services
```bash
# Primary service
cd services/primary-service
node server.js

# Secondary service
cd ../secondary-service
node server.js
```

---

## 📁 Folder Structure

```
services/
├── primary-service/       # MySQL-based product/order logic
├── secondary-service/     # Review logic with Redis caching
server/                    # Reserved for Authentication/API Gateway
client/                    # React frontend (handled by teammate)
```

---

## ✅ Completed By This Group Member:
- [x] Primary Service
- [x] Secondary (Review) Service
- [x] SQL + NoSQL setup
- [x] Redis caching
- [x] Swagger Documentation

📌 `server/` folder will be handled by teammate for authentication.

---