# 🔍 Trace It

![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat&logo=react) ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js) ![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=flat&logo=python) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker) ![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens)

Trace It is a full-stack lost and found platform powered by **AI semantic matching**. Instead of relying on keyword search, it uses a pre-trained sentence transformer model to understand the *meaning* of descriptions — so "dark bifold wallet" still matches "black leather wallet" even when no words overlap.

The platform allows users to:
- Report lost and found items with descriptions
- Run AI-powered semantic matching to find the most likely matches
- Manage their reported items through a personal dashboard
- Authenticate securely via JWT cookie-based sessions

---

## 📌 Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [Application Workflow](#application-workflow)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [Author](#author)

---

## 📖 Overview

Traditional lost and found systems rely on exact keyword matches — if someone writes "purse" and another writes "handbag", they'll never find each other.

Trace It solves this with semantic AI matching:

- A user reports a lost item with a description
- The system encodes the description into a 384-dimensional vector using `all-MiniLM-L6-v2`
- All found item descriptions are encoded the same way
- Cosine similarity scores are calculated between the lost item and every found item
- Results are ranked and returned — the closest semantic matches appear first

The entire stack runs in Docker containers with a single command.

---

## 📸 Screenshots

### Home
![Home](frontend/public/Home.png)

### Lost Items
![Lost Items](frontend/public/Lost.png)

### Found Items
![Found Items](frontend/public/Found.png)

### AI Semantic Matching
![AI Semantic Matching](frontend/public/AI%20Semantic%20Matching.png)

---

## ✨ Core Features

### 👤 User System
- Registration and login with secure JWT authentication
- HTTP-only cookie sessions
- Personal dashboard showing reported items
- Protected routes — unauthenticated users redirected to login

### 🔍 AI Semantic Matching
- Powered by `sentence-transformers` and `all-MiniLM-L6-v2`
- Understands meaning — not just keywords
- Returns ranked matches with similarity scores (0.0 to 1.0)
- Model baked into Docker image — instant startup, no download delay

### 📦 Lost & Found Management
- Report lost items with descriptions
- Report found items with descriptions
- Trigger AI match for any lost item against all found items
- View ranked match results in the UI

### 🔐 Security
- JWT authentication with `jsonwebtoken`
- Bcrypt password hashing
- HTTP-only cookies — token never accessible via JavaScript
- Protected routes on both frontend and backend
- `.env` secrets never committed or baked into Docker images

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React + Vite | UI framework and fast build tool |
| React Router | Client-side routing |
| Axios | HTTP requests with cookie support |
| Context API | Global auth state management |

### Node Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| Mongoose | MongoDB schema and queries |
| JWT | Token-based authentication |
| Bcrypt | Password hashing |
| Axios | Calls Python AI service internally |

### Python AI Service
| Technology | Purpose |
|-----------|---------|
| Flask | Lightweight HTTP server |
| sentence-transformers | Text-to-vector embedding |
| PyTorch (CPU) | ML engine underlying the model |
| `all-MiniLM-L6-v2` | Pre-trained semantic similarity model |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Nginx | Serves React static files in production |
| MongoDB Atlas | Cloud-hosted database |

---

## 🧠 Architecture

Trace It follows a three-service architecture where each service has a single responsibility:

```
Browser
   │
   │  HTTP (port 3001)
   ▼
React Frontend (Nginx)
   │
   │  HTTP (port 3000)
   ▼
Node/Express Backend ──────────────────► MongoDB Atlas (cloud)
   │
   │  HTTP (internal — port 5000)
   ▼
Python AI Service (Flask)
```

**Key architectural decisions:**

- The Python service is **internal only** — never exposed to the browser. Only Node calls it.
- MongoDB is hosted on **Atlas** — no database container needed.
- All three services share a private Docker network (`traceit-net`). Services communicate using their Compose service name as hostname (e.g. `http://python-ai:5000`).
- React's API URL is **baked into the build** via a Vite build argument — no runtime config needed.

---

## 📂 Project Structure

```text
TraceIt/
├── docker-compose.yml               # Wires all 3 services + network
├── docker-compose.override.yml      # Dev overrides (hot reload)
├── README.md
│
├── backend-node/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env                         # Secrets — never committed
│   ├── server.js                    # Entry point
│   ├── package.json
│   └── src/
│       ├── app.js                   # Express setup, middleware, routes
│       ├── db/db.js                 # MongoDB Atlas connection
│       ├── models/
│       │   ├── user.model.js
│       │   ├── lostItem.model.js
│       │   └── foundItem.model.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── lostItem.controller.js
│       │   └── foundItem.controller.js
│       ├── routes/
│       │   ├── auth.route.js
│       │   ├── lostitem.route.js
│       │   └── foundItem.route.js
│       └── middlewares/
│           └── auth.middleware.js
│
├── backend-python/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── app.py                       # Flask app — POST /match
│   └── requirements.txt
│
└── frontend/
    ├── Dockerfile                   # Multi-stage: Node builds, Nginx serves
    ├── .dockerignore
    ├── public/
    │   ├── Home.png
    │   ├── Lost.png
    │   ├── Found.png
    │   └── AI Semantic Matching.png
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── context/AuthContext.jsx
        ├── services/api.js
        ├── components/
        └── pages/
```

---

## 🔌 API Endpoints

### Authentication
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create new account |
| POST | `/api/auth/login` | No | Login, receive JWT cookie |
| POST | `/api/auth/logout` | Yes | Clear auth cookie |
| GET | `/api/auth/me` | Yes | Get current user |

### Lost Items
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/lost` | Yes | Get all lost items |
| POST | `/api/lost` | Yes | Report a lost item |
| GET | `/api/lost/match/:id` | Yes | Run AI match for a lost item |

### Found Items
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/found` | Yes | Get all found items |
| POST | `/api/found` | Yes | Report a found item |

### Python AI Service (internal only)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/match` | Returns ranked similarity scores |

---

## 🐳 Docker Setup

### Prerequisites
- Docker Desktop installed and running
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Mumuksh-Jain/TraceIt.git
cd TraceIt

# Create backend-node/.env with your secrets (see below)

# Start the entire stack
docker compose up -d

# Check all services are running
docker compose ps
```

| Service | URL |
|---------|-----|
| React Frontend | http://localhost:3001 |
| Node API | http://localhost:3000 |
| Python AI | http://localhost:5000 |

### Common commands

```bash
# Rebuild after code changes
docker compose up --build -d

# Rebuild one service only
docker compose up --build node-backend -d

# View logs
docker compose logs -f node-backend

# Stop everything
docker compose down
```

### Dev vs prod

```bash
# Development — hot reload active (override auto-loaded)
docker compose up -d

# Production — no hot reload
docker compose -f docker-compose.yml up -d
```

---

## 🔑 Environment Variables

Create `backend-node/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/TraceIt
PYTHON_API_URL=http://python-ai:5000
JWT_SECRET_KEY=your_secret_key_here
PORT=3000
```

| Variable | Docker value | Local dev value |
|----------|-------------|----------------|
| `MONGODB_URI` | Atlas URI (same) | Atlas URI (same) |
| `PYTHON_API_URL` | `http://python-ai:5000` | `http://localhost:5000` |
| `JWT_SECRET_KEY` | same | same |
| `PORT` | `3000` | `3000` |

> **Never commit `.env` to Git.**

---

## 🔄 Application Workflow

### AI Match Request — step by step

1. React sends `GET /api/lost/match/:id`
2. `protectRoute` verifies JWT cookie → attaches `req.user`
3. Controller fetches lost item + all found items from MongoDB Atlas
4. Node POSTs descriptions to `http://python-ai:5000/match`
5. Python encodes all text into 384-dimensional vectors using `all-MiniLM-L6-v2`
6. Cosine similarity calculated between lost vector and every found vector
7. Results sorted by score descending
8. Ranked matches returned → React displays results

---

## 🚧 Future Improvements

- [ ] Real-time notifications when a match is found
- [ ] Image upload support for lost/found items
- [ ] Location-based filtering
- [ ] Admin dashboard for moderation
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Multilingual AI matching

---

## 🤝 Contributing

```bash
# Fork the repository
git checkout -b feature-name
git commit -m "Add new feature"
git push origin feature-name
# Open a Pull Request
```

---

## 👨‍💻 Author

Developed by **Mumuksh Jain**

- GitHub: [@Mumuksh-Jain](https://github.com/Mumuksh-Jain)

---

⭐ If you found this project useful, consider giving it a star!