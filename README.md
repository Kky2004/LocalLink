# LocalLink 🚀

**LocalLink** is a full-stack MERN marketplace application where users can discover, book, and review local service providers, and service providers can manage services, orders, and earnings.

> Full-stack app with backend API, JWT authentication, protected routes, and deployed frontend + backend.

---

## 🌐 Live Deployment

👉 **Frontend (Client):** `https://locallink-frontend.onrender.com`  
👉 **Backend (API):** `https://locallink-backend-ituo.onrender.com`  

---

## 🛠️ Tech Stack

**Frontend**
- React.js (JSX)
- React Router
- Tailwind CSS for UI
- Axios for API requests

**Backend**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- dotenv for environment configuration

---

## ✨ Key Features

### 🔐 Authentication & Security
- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Protected API routes
- Secure environment variable usage

### 👥 User & Service Management
- Users can browse local services
- Service providers can add and manage services
- CRUD operations using REST APIs
- Role-based access control (User / Provider)

### 🧩 Backend Architecture
- RESTful API design
- MVC folder structure
- Middleware-based authentication
- Centralized error handling
- MongoDB schema modeling

---

---

## 🔌 API Endpoints (Sample)

### Authentication
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile (Protected)


### Services
GET /api/services
POST /api/services (Protected – Provider)
GET /api/services/:id
PUT /api/services/:id (Protected)
DELETE /api/services/:id (Protected)

---

## ▶️ Run Locally

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Kky2004/LocalLink.git
cd LocalLink
2️⃣ Backend setup
cd server
npm install
npm start
Backend runs on: http://localhost:5000

3️⃣ Frontend setup
cd ../client
npm install
npm start

```

## Screenshots
<img width="1896" height="862" alt="Screenshot 2026-02-02 211733" src="https://github.com/user-attachments/assets/64fb5969-ebc9-4661-b4ff-6b5d3642dcfe" />


