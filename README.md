# cafe-management-system-fullstack
Full-stack Cafe Management System using React, Flask and MySQL

Café Management System

Full Stack CCP Project

 Project Overview

The **Café Management System** is a full-stack web application developed as part of the **CCP (Course Completion Project)**.
It automates cafeteria operations such as user authentication, menu management, order processing, and administrative control.

The system is built using:

* **Frontend:** React.js
* **Backend:** Flask (Python)
* **Database:** MySQL

This project follows a **modular architecture** with clear separation between frontend and backend

## Project Architecture

```
Frontend (React)
frontend/
├ node_modules/
├ public/
└── src/
    ├Components/
    │   ├ AdminDashboard.js
    │   ├ Login.js
    │   ├Register.js
    │   └─ UsersDashboard.js
    ├ App.js
    ├ App.css
    ├ index.js
    ├ index.css
    ├ styles.css
    └── reportWebVitals.js

Backend (Flask)
backend/
├app.py

```

---

## 🔐 Module 1: Authentication & Authorization

### Features

* User Registration
* Secure Login using **Bcrypt hashing**
* Role-based access control (`user` / `admin`)
* Session-based authentication
* Admin role request & approval system

### Technologies Used

* Flask Sessions
* Flask-Bcrypt
* MySQL


### Flow

1. User registers as **normal user**
2. User logs in
3. User can request admin access
4. Admin approves/rejects request


## 👤 Module 2: User Dashboard

### Features

* View menu items
* Place orders
* Automatic stock validation
* Order total calculation
* Secure order placement

### Backend Logic

* Orders stored in `orders`
* Order items stored in `order_items`
* Stock updated in real time

## 🛠️ Module 3: Admin Dashboard

### Features

* View all users
* Approve/reject admin requests
* Manage menu stock
* View all orders
* Revenue & order analytics

### Admin Summary API

* Total orders
* Total revenue
* Total users


## 🗄️ Module 4: Database Design (ERD)

### Entities

Database Tables Description
users
Stores user credentials and role information.
•	id (Primary Key)
•	username
•	password (hashed)
•	role
 
admin_requests
Stores admin access requests.
•	id (Primary Key)
•	user_id (Foreign Key)
•	status
•	note
•	created_at
 
menu_items
Stores cafeteria menu details.
•	id (Primary Key)
•	name
•	category
•	price
•	stock
•	created_at
 

orders
Stores order summary information.
•	id (Primary Key)
•	user_id (Foreign Key)
•	total_amount
•	created_at
 
order_items
Stores item-level details of each order.
•	id (Primary Key)
•	order_id (Foreign Key)
•	item_id (Foreign Key)
•	quantity
•	price_each
 



##  Backend Setup Instructions

###  Create Database

```sql
CREATE DATABASE cafeteria_db;
USE cafeteria_db;
```

### 2️⃣ Required Tables

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user'
);

CREATE TABLE admin_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10,2),
    stock INT
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    item_id INT,
    quantity INT,
    price_each DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (item_id) REFERENCES menu_items(id)
);
```

---

## ▶️ How to Run the Project

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🔒 Security Measures

* Password hashing using **bcrypt**
* Session-based authentication
* Role-based authorization
* SQL injection protection via parameterized queries

---

## 🏁 Conclusion

This Café Management System demonstrates the practical implementation of **full-stack development concepts**, including authentication, RESTful APIs, database design, and frontend-backend integration.
The project follows clean architecture, secure coding practices, and real-world business logic suitable for cafeteria operations.

---

## 📎 Appendix

* ERD Diagram
* SQL Schema
* API Routes Documentation
* Screenshots of all modules

---

##  Developed By

**Arwa Iftikhar**
Full Stack CCP Project

---

##  Future Enhancements

* Online payment integration
* Order history for users
* Role-based UI rendering
* Cloud deployment

---

##  Final Step (IMPORTANT)

Now commit README:

```powershell
git add README.md
git commit -m "Added detailed project documentation"
git push
```

---

