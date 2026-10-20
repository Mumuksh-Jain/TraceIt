# Trace It — Docker & Infrastructure Documentation

## Introduction for Beginners
Docker is the technology that packages all three parts of Trace It — the React frontend, the Node backend, and the Python AI service — into isolated, portable containers that run identically on any machine.

Without Docker, deploying Trace It means:
* Manually installing Node, Python, pip, and all packages on the server
* Hoping the server's Node version matches your local version
* Debugging "works on my machine" issues for hours
* Writing long setup documentation for teammates

With Docker:
* Every service is packaged with everything it needs
* One command starts the entire stack: `docker compose up`
* Identical behaviour on your laptop, your teammate's Mac, and a cloud server

---

## Core Concepts

### Image vs Container

| | Image | Container |
|---|---|---|
| What it is | A frozen snapshot of your app | A running instance of an image |
| Analogy | A class definition | An object/instance |
| Created by | `docker build` | `docker run` |
| Stored | On disk | In memory (while running) |
| Can have many | One image → 50 containers | Each container is isolated |

### Layer Caching

Every line in a Dockerfile creates one layer. Layers are cached. If a line hasn't changed, Docker reuses the cached result — skipping that step entirely.

```
Line 1: FROM node:20-alpine          → cached after first build
Line 2: WORKDIR /app                 → cached
Line 3: COPY package*.json ./        → cached if package.json unchanged
Line 4: RUN npm ci                   → cached if package.json unchanged ← KEY
Line 5: COPY . .                     → runs every time code changes
```

**The golden rule:** Put things that change rarely at the top. Put your source code at the bottom. This makes rebuilds take 2 seconds instead of 45 seconds.

---

## Project Structure

```text
TraceIt/
├── docker-compose.yml           # Defines and wires all 3 services together
├── docker-compose.override.yml  # Dev-only overrides (hot reload, volume mounts)
├── backend-node/
│   ├── Dockerfile               # Node/Express container instructions
│   ├── .dockerignore            # Excludes node_modules, .env from image
│   └── .env                     # Runtime secrets (never committed to Git)
├── backend-python/
│   ├── Dockerfile               # Python AI container instructions
│   ├── .dockerignore            # Excludes __pycache__, .venv from image
│   └── requirements.txt         # Python dependencies
└── frontend/
    ├── Dockerfile               # React multi-stage build instructions
    └── .dockerignore            # Excludes node_modules, dist from image
```

---

## The Three Dockerfiles

### Node Backend (`backend-node/Dockerfile`)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

| Decision | Reason |
|----------|--------|
| `node:20-alpine` | 180MB vs 1GB. Alpine Linux strips everything non-essential. |
| `COPY package*.json` first | npm ci layer cached unless dependencies change. |
| `--only=production` | Skips devDependencies (nodemon, jest). Smaller image. |
| `CMD ["node", "server.js"]` | Array syntax — correctly passes signals (Ctrl+C) to the process. |

---

### Python AI Service (`backend-python/Dockerfile`)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

| Decision | Reason |
|----------|--------|
| `python:3.12-slim` | Stripped Debian. ~130MB vs 1GB full image. |
| `gcc` before pip | sentence-transformers needs C compiler. Without it pip crashes. |
| `rm -rf /var/lib/apt/lists/*` | Cleans apt cache — saves ~30MB in the layer. |
| CPU-only PyTorch | 188MB download vs 915MB + 1.5GB CUDA libs. No GPU needed. |
| Model baked into image | Container starts instantly — no 30-second download on every boot. |

---

### React Frontend (`frontend/Dockerfile`)

```dockerfile
# Stage 1 — Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2 — Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Multi-stage build explained:**

Stage 1 uses Node to compile React into static HTML/CSS/JS files (`dist/` folder). This requires Node + all devDependencies — a heavy environment.

Stage 2 starts completely fresh with just Nginx (~25MB). It copies only the built `dist/` folder from Stage 1 using `COPY --from=builder`. The 200MB Node environment is thrown away entirely.

| Decision | Reason |
|----------|--------|
| Two FROM statements | Node builds, Nginx serves. Final image is ~30MB. |
| `ARG VITE_API_URL` | Passes the API URL at build time so Vite bakes it into the JS bundle. |
| `COPY --from=builder` | The bridge between stages — copies built files, nothing else. |
| `daemon off;` | Keeps Nginx in the foreground — required for Docker containers. |

---

## Docker Compose

### `docker-compose.yml` (Production/Base)

```yaml
services:
  python-ai:
    build: ./backend-python
    container_name: python-ai
    ports:
      - "5000:5000"
    restart: unless-stopped
    networks: [traceit-net]

  node-backend:
    build: ./backend-node
    env_file: ./backend-node/.env
    container_name: node-backend
    ports:
      - "3000:3000"
    restart: unless-stopped
    depends_on: [python-ai]
    networks: [traceit-net]

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: http://localhost:3000/api
    container_name: frontend
    ports:
      - "3001:80"
    depends_on: [node-backend]
    networks: [traceit-net]

networks:
  traceit-net:
```

### `docker-compose.override.yml` (Development — auto-loaded)

```yaml
services:
  node-backend:
    volumes:
      - ./backend-node:/app
      - /app/node_modules
    command: npx nodemon --legacy-watch server.js
    environment:
      - NODE_ENV=development

  python-ai:
    volumes:
      - ./backend-python:/app
    command: python -m flask run --host=0.0.0.0 --port=5000 --reload
```

---

## Networking — How Services Talk to Each Other

All services share `traceit-net` — a private Docker bridge network. On this network, **each service's name becomes its hostname**.

```
Inside Docker:
  node-backend calls python-ai at → http://python-ai:5000/match
  node-backend calls MongoDB at   → mongodb+srv://...atlas... (cloud, unchanged)

From browser (outside Docker):
  Browser calls node-backend at   → http://localhost:3000/api
  Browser calls frontend at       → http://localhost:3001
```

**The localhost rule:**
* `localhost` inside a container = the container itself, not other containers
* Service-to-service calls always use the service name: `http://python-ai:5000`
* Browser-to-container calls always use `localhost` + the mapped port

---

## Environment Variables

### `backend-node/.env`

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/TraceIt
PYTHON_API_URL=http://python-ai:5000
JWT_SECRET_KEY=your_secret_key_here
PORT=3000
```

| Variable | Dev value | Docker value |
|----------|-----------|--------------|
| `MONGODB_URI` | `mongodb://localhost:27017/TraceIt` | Same — Atlas is cloud |
| `PYTHON_API_URL` | `http://localhost:5000` | `http://python-ai:5000` |
| `JWT_SECRET_KEY` | same | same |
| `PORT` | `3000` | `3000` |

Only `PYTHON_API_URL` changes between local dev and Docker.

---

## Port Mapping

```
Your machine          Docker container
localhost:3001    →   frontend:80      (Nginx)
localhost:3000    →   node-backend:3000 (Express)
localhost:5000    →   python-ai:5000   (Flask)
```

Format: `HOST_PORT:CONTAINER_PORT`. Left = your machine. Right = inside container.

---

## The depends_on Chain

```
python-ai starts first
    ↓
node-backend starts second (depends_on: python-ai)
    ↓
frontend starts last (depends_on: node-backend)
```

Without `depends_on`, all services start simultaneously. Node would try to connect to Python before it's ready and crash.

---

## Essential Commands

```bash
# Start everything (dev — hot reload active)
docker compose up -d

# Start production only (no override)
docker compose -f docker-compose.yml up -d

# Rebuild all images then start
docker compose up --build -d

# Rebuild one service only
docker compose up --build node-backend -d

# Check status
docker compose ps

# View logs for one service
docker compose logs node-backend

# Follow live logs for all services
docker compose logs -f

# Get a shell inside a running container
docker compose exec node-backend sh

# Check env vars inside container
docker compose exec node-backend env

# Stop everything
docker compose down

# Stop and remove volumes
docker compose down -v

# Free up disk space
docker system prune

# Check disk usage
docker system df
```

---

## Debug Flow

When something breaks, always follow this order:

```
1. docker compose ps          → Is the container actually running?
2. docker compose logs <svc>  → What is it saying? Read the error.
3. docker compose exec <svc> sh → Get inside and investigate.
```

Common issues and fixes:

| Problem | Fix |
|---------|-----|
| Site not loading at :3001 | `docker compose ps` — check frontend is Up with correct port |
| Port already allocated | `docker compose down` then `docker compose up -d` |
| Node can't reach Python | Check `PYTHON_API_URL=http://python-ai:5000` in `.env` |
| Database not connecting | `docker compose exec node-backend env \| grep MONGODB` |
| Changes not reflecting | `docker compose up --build` |
| Container exits immediately | `docker compose logs <service>` — read the crash error |
| Out of disk space | `docker system prune` |

---

## .dockerignore Files

Each service has a `.dockerignore` that prevents unnecessary files from being copied into the image:

**Node:**
```
node_modules
.env
.env.local
.git
npm-debug.log
```

**Python:**
```
__pycache__
*.pyc
.env
.venv
venv/
.git
```

**Frontend:**
```
node_modules
.env
.env.local
.git
dist
```

> **Never copy `.env` into an image.** Images can be shared, pushed to registries, or inspected. Secrets baked into images are a serious security vulnerability.

---

## Image Sizes

| Service | Base Image | Final Size | Notes |
|---------|-----------|-----------|-------|
| `traceit-node` | node:20-alpine | ~265MB | Express + Mongoose + deps |
| `traceit-python` | python:3.12-slim | ~1GB | PyTorch CPU + model |
| `traceit-frontend` | nginx:alpine | ~30MB | Static files + Nginx only |