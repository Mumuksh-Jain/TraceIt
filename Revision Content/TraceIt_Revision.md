# Trace It — Complete Revision Guide

> Personal revision document covering every concept, file, code flow, and interview question for the project.

---

## 📅 Revision Schedule

Starting from today (25 March 2026). Uses spaced repetition for long-term retention.

| Day | Date | Focus Area | What to Do |
|-----|------|-----------|------------|
| 1 | 25 Mar | Overview + Architecture | Read Sections 1-2. Draw the architecture diagram from memory. |
| 2 | 26 Mar | Node Backend Deep Dive | Read Section 3. Trace a request from `server.js` → controller. Write `protectRoute` from memory. |
| 3 | 27 Mar | Python AI Service | Read Section 4. Explain embeddings and cosine similarity out loud. Write `app.py` from memory. |
| 4 | 28 Mar | React Frontend | Read Section 5. Trace the AuthContext flow. Explain how `ItemDetail` renders matches. |
| 5 | 29 Mar | Docker + Security | Read Sections 6-7. Explain multi-stage builds, layer caching, JWT cookie flow from memory. |
| 6 | 30 Mar | Image Upload + AI Pipeline | Read Sections 8-9. Draw the Multer → Cloudinary pipeline. Explain enrichment step. |
| 7 | 31 Mar | Interview Questions | Read Section 10. Answer every question out loud without looking at answers. |
| **Review 1** | 3 Apr | Full Review | Re-read entire doc. Focus on weak areas. Answer interview Qs again. |
| **Review 2** | 7 Apr | Full Review | Skim doc. Do all interview Qs from memory. Draw architecture + data flow. |
| **Review 3** | 14 Apr | Final Review | Quick skim. Mock interview — answer all Qs out loud in under 2 mins each. |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Node/Express Backend](#3-nodeexpress-backend)
4. [Python AI Service](#4-python-ai-service)
5. [React Frontend](#5-react-frontend)
6. [Docker & Infrastructure](#6-docker--infrastructure)
7. [Security & Authentication](#7-security--authentication)
8. [AI Matching Pipeline](#8-ai-matching-pipeline)
9. [Image Upload Pipeline](#9-image-upload-pipeline)
10. [Interview Questions & Answers](#10-interview-questions--answers)

---

## 1. Project Overview

**What:** Full-stack lost & found platform with AI semantic matching.
**Problem:** Keyword search fails — "purse" never matches "handbag".
**Solution:** Sentence-transformers encode text into 384-dim vectors. Cosine similarity finds meaning-based matches.

**Three services:**

| Service | Tech | Port | Job |
|---------|------|------|-----|
| Frontend | React + Vite → Nginx | 3001 | UI |
| Node Backend | Express + Mongoose | 3000 | API, auth, CRUD, orchestration |
| Python AI | Flask + sentence-transformers | 5000 | Encode text → vectors → similarity scores |

**External services:** MongoDB Atlas (database), Cloudinary (image storage)

---

## 2. Architecture

```
Browser
   │  HTTP :3001
   ▼
React (Nginx container)
   │  HTTP :3000 (Axios, withCredentials: true)
   ▼
Node/Express Backend ──► MongoDB Atlas (mongoose.connect)
   │                └──► Cloudinary (upload_stream)
   │  HTTP :5000 (internal, axios.post)
   ▼
Python Flask AI Service
```

**Key rules:**
- Python is **internal only** — browser never talks to it, only Node does
- Inside Docker, services use **service names** as hostnames: `http://python-ai:5000`
- `localhost` inside a container = that container itself, NOT other containers
- All services share `traceit-net` private Docker bridge network
- `credentials: true` on Axios = browser sends JWT cookie with every request

---

## 3. Node/Express Backend

### 3.1 Entry Point — `server.js`

```javascript
const dotenv = require("dotenv");
dotenv.config();                        // Load .env into process.env
const connectDb = require("./src/db/db");
const app = require("./src/app");
const PORT = process.env.PORT || 8000;  // Fallback to 8000 if PORT not set
connectDb();                            // Connect to MongoDB Atlas
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

**Why `dotenv.config()` is first:** Environment variables must be loaded before anything reads them (db.js needs `MONGODB_URI`).

#### 💡 Deep Dive: The Startup Sequence
- **Environment Bootstrapping:** `dotenv.config()` reads your `.env` file and attaches those secret keys to `process.env`. This is crucial because if you try to connect to the database *before* this line, `process.env.MONGODB_URI` would be `undefined`, causing a crash.
- **Service Orchestration:** `server.js` acts as the 'orchestrator'. It doesn't contain logic itself; it simply pulls together the **Database** (`db.js`) and the **Express App** (`app.js`) and tells them to start running on the designated port.
- **Port Flexibility:** By using `process.env.PORT || 8000`, the app becomes "environment aware". In a local environment, it uses 8000, but in a production environment like Render or AWS, the platform usually provides a specific port via environment variables which the app will automatically pick up.

### 3.2 App Setup — `src/app.js`

```javascript
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

// Health check — no auth, no middleware
app.get("/health", (req, res) => { res.status(200).send("OK"); });

// CORS — controls which origins can make requests
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",              // Vite dev server
      "https://trace-it-nu.vercel.app/"     // Production
    ];
    if (!origin ||                          // Server-to-server (Postman, etc.)
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")) {   // Vercel preview deployments
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true    // CRITICAL: allows cookies to be sent cross-origin
}));

app.use(express.json());     // Parse JSON bodies
app.use(cookieParser());     // Parse cookies → req.cookies
app.use("/api/lost", lostitemRoutes);
app.use("/api/found", foundItemRoutes);
app.use("/api/auth", authRoutes);
module.exports = app;
```

**Why `credentials: true`?** Without it, the browser strips cookies from cross-origin requests. JWT lives in a cookie, so without this, every request would be "Unauthorized".

#### 💡 Deep Dive: The Middleware Pipeline
- **Modern CORS Strategy:** Notice the dynamic `origin` function. Instead of just a string, we use a function to allow **localhost** (for dev) and **Vercel** (for prod). This is safer than using `*` (wildcard), which is actually forbidden anyway when `credentials: true` is used.
- **Security through Cookies:** We use `cookie-parser` because our authentication strategy relies on **HTTP-only cookies**. Unlike headers (like `Authorization: Bearer <token>`), cookies are automatically handled by the browser, reducing the surface area for front-end developers to mess up security.
- **JSON Parsing:** `express.json()` is the gatekeeper for all `POST`, `PUT`, and `PATCH` requests. Without it, `req.body` would be `undefined`, and you wouldn't be able to read any data sent from the React forms.

### 3.3 Database — `src/db/db.js`

```javascript
async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected");
    } catch (error) {
        console.error("Database not connected");
    }
}
```

Uses MongoDB Atlas — connection string includes username, password, cluster address. Called once at startup. Mongoose manages the connection pool internally.

#### 💡 Deep Dive: The Database Connection
- **Mongoose vs. Driver:** We use Mongoose because it provides a "Schema" layer over the schemaless MongoDB. This prevents us from accidentally saving a user without an email or an item without a description.
- **Asynchronous Connection:** The connection is `async`. We use `await` inside the `try/catch` block to ensure that if the internet is down or the credentials are wrong, the server logs a clear error instead of hanging indefinitely.
- **Singleton Pattern:** Once `mongoose.connect()` is called in `server.js`, that connection remains "active" across the entire application. Every time you use a Model (`userModel.find()`), Mongoose automatically uses this existing connection.

### 3.4 Models

**User (`user.model.js`):**

```javascript
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },  // bcrypt hash, NEVER plaintext
    createdAt: { type: Date, default: Date.now }
});
```

**Lost Item / Found Item (identical schema):**

```javascript
const lostItemSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    description: { type: String, required: true },  // Used for AI matching
    location:    { type: String, required: true },
    category:    { type: String, required: true },
    image:       { type: String },                   // Cloudinary HTTPS URL
    reportedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status:      { type: String, enum: ["Open", "Closed"], default: "Open" },
    createdAt:   { type: Date, default: Date.now }
});
```

**Why `ObjectId` ref?** Links each item to the user who created it. Enables ownership checks for delete/status updates.
**Why separate collections (not one with type field)?** Matching is always lost → found. Separate collections make queries cleaner.

#### 💡 Deep Dive: Data Architecture
- **Schema Validation:** In the `User` model, `unique: true` is more than a flag; it tells MongoDB to create an "Unique Index". This means even if two simultaneous requests try to register with the same email, the database layer itself will block the second one, maintaining perfect data integrity.
- **Referential Integrity:** The `reportedBy` field using `ObjectId` and `ref: 'User'` allows us to "populate" the data later. For example, if we want to show who found an item, we can just call `.populate('reportedBy')` in our query, and Mongoose will automatically fetch that user's name and email for us.
- **Strategic Separation:** By separating `LostItem` and `FoundItem`, we optimize for our primary feature: **Matching**. When a user looks for their lost keys, we only need to search the `foundItems` collection. Keeping them separate prevents the database from scanning unnecessary "Lost" reports during a match search, which improves performance as the app scales.

### 3.5 Auth Controller — `auth.controller.js`

**Register:**
```javascript
async function Register(req, res) {
    const { username, email, password } = req.body;
    // 1. Check if user already exists (by username OR email)
    const isAlreadyUser = await userModel.findOne({
        $or: [{ username }, { email }]       // MongoDB $or operator
    });
    if (isAlreadyUser) return res.status(500).json({ message: "User already exists" });

    // 2. Hash password (NEVER store plaintext)
    const hash = await bcrypt.hash(password, 10);  // 10 salt rounds = 2^10 iterations

    // 3. Create user document in MongoDB
    const user = await userModel.create({ username, email, password: hash });

    // 4. Sign JWT — payload contains only the user's ID
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

    // 5. Set HTTP-only cookie — JS cannot read this cookie
    res.cookie("token", token, {
        httpOnly: true,      // Invisible to document.cookie (XSS protection)
        sameSite: "none",    // Required for cross-domain cookies
        secure: true,        // Only sent over HTTPS (required when sameSite=none)
    });
    return res.status(200).json({ message: "User successfully registered" });
}
```

**Login:** Same flow but uses `bcrypt.compare(password, user.password)` instead of hash. Also adds `maxAge: 60 * 60 * 1000` (1 hour in ms).

**Logout:** `res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true })` — must pass same options as when setting the cookie.

**CheckAuth:** `userModel.findById(req.user.id).select("-password")` — the `-password` excludes the hash from the response.

#### 💡 Deep Dive: Modern Authentication Logic
- **Hashing vs Encryption:** Remember, we **hash** passwords, we don't encrypt them. Encryption can be reversed; hashing cannot. By using `bcrypt`, even if a hacker steals the database, they only see garbled strings. `bcrypt` also uses a "Salt" (the `10` rounds), which prevents attackers from using pre-computed "Rainbow Tables" to guess common passwords.
- **The JWT Strategy:** Instead of storing "sessions" in the database (which makes the server heavy), we use stateless **JWTs**. The token itself contains the user's ID. When the server sees the token, it trusts it because it was signed with our `SECRET_KEY`. It's like a digital ID card that only our server can issue.
- **XSS vs CSRF Protection:** By using `httpOnly: true`, we make the token impossible to steal via JavaScript (XSS). By using `sameSite: "none"` and `secure: true`, we ensure the browser only sends this cookie to our specific API, protecting us from Cross-Site Request Forgery (CSRF).

### 3.6 Auth Middleware — `auth.middleware.js`

```javascript
async function protectRoute(req, res, next) {
    const token = req.cookies.token;           // Read JWT from cookie
    if (!token) return res.status(400).json({ message: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;   // { id: "..." } — available in all subsequent handlers
        next();               // Continue to the controller
    } catch (err) {
        return res.status(400).json({ message: "Unauthorized" });
    }
}
```

**Applied to:** Every route that requires login. Placed before the controller in the route chain.

#### 💡 Deep Dive: The Gatekeeper Middleware
- **Decoupled Security:** The controller `createItem` shouldn't have to worry about whether a user is logged in. By moving this logic to `protectRoute`, we keep our controllers clean. The controller simply assumes that if it's running, `req.user` is valid.
- **Error Propagation:** If `jwt.verify` fails, it throws an error. Our `try/catch` block catches this and sends a `400` status. This prevents the "Next" function from being called, effectively stopping an unauthorized user from ever seeing sensitive data.
- **Identity Injection:** Notice `req.user = decoded`. This is where the magic happens. We're effectively "injecting" the user's identity into the request object. This allows later functions to know exactly who is making the request without having to re-verify the token.

### 3.7 Storage Service — `services/storage.service.js`

```javascript
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Multer — store file in RAM (never touches disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary config from env vars
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload buffer to Cloudinary → returns HTTPS URL
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: "TraceIt" },              // All images in TraceIt/ folder
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url); // HTTPS URL
            }
        ).end(fileBuffer);                       // Send entire buffer
    });
};

module.exports = { upload, uploadToCloudinary };
```

**Why `memoryStorage`?** File only exists briefly to stream to Cloudinary. No disk writes = faster + no cleanup needed.
**Why `upload_stream`?** Accepts a buffer via writable stream. `.end(fileBuffer)` pushes the complete file in one call.
**Routes use:** `upload.single("image")` as middleware — processes the file before controller runs.

#### 💡 Deep Dive: The Image Upload Pipeline
- **Memory vs. Disk:** We use `multer.memoryStorage()` for speed. Writing to a container's disk is slow and ephermeral. By keeping the photo in RAM, we can stream it directly to Cloudinary and then release that memory, ensuring the server stays fast even with many simultaneous uploads.
- **Asynchronous Streaming:** Cloudinary's `upload_stream` is wrapped in a **Promise**. This allows the Node server to "await" the upload result. While waiting, the server can still process other requests, making the entire system non-blocking and highly scalable.
- **Secure URLs:** Always use `secure_url`. It ensures the image is served over HTTPS, which is required by modern browsers and improves the overall security posture of the platform.

### 3.8 Lost Item Controller — Key Functions

**createItem:**
```javascript
async function createItem(req, res) {
    const { title, description, location, category } = req.body;
    const imageUrl = await uploadToCloudinary(req.file.buffer);  // Multer gave us the buffer
    const item = await lostItemModel.create({
        title, description, location, category,
        image: imageUrl,            // Cloudinary URL stored in DB
        reportedBy: req.user.id     // From JWT via protectRoute
    });
    return res.status(200).json({ message: "Item created successfully!", item });
}
```

**getItem (with search + filter):**
```javascript
async function getItem(req, res) {
    const { q, category } = req.query;   // ?q=wallet&category=Electronics
    let filter = {};
    if (q) {
        filter.$or = [
            { title: { $regex: q, $options: 'i' } },        // Case-insensitive regex
            { description: { $regex: q, $options: 'i' } }
        ];
    }
    if (category) { filter.category = category; }           // Exact match
    const items = await lostItemModel.find(filter);
    return res.status(200).json({ message: "Items Fetched Successfully", items });
}
```

**deleteItem (owner-only):**
```javascript
const isOwner = item.reportedBy.toString() === req.user.id;  // ObjectId → string comparison
if (!isOwner) return res.status(403).json({ message: "You cannot delete these message" });
await lostItemModel.findByIdAndDelete(id);
```

**matchItem (the AI trigger):**
```javascript
async function matchItem(req, res) {
    const lostItem = await lostItemModel.findById(id);
    const foundItem = await foundItemModel.find();           // ALL found items
    const description = lostItem.description;

    // Python returns: { matches: [{ index, score, description }] }
    // Node ENRICHES each match with the full item data:
    const enrichedMatches = response.data.matches.map(match => {
        const originalItem = foundItem[match.index];
        return {
            ...match,
            _id: originalItem._id,
            title: originalItem.title,
            location: originalItem.location,
            category: originalItem.category,
            image: originalItem.image
        };
    });
    return res.status(200).json({ matches: enrichedMatches });
}
```

#### 💡 Deep Dive: The Logic of Retrieval & Matching
- **Atomic CRUD:** Notice that we always check for ownership *before* performing a delete or update. The comparison `item.reportedBy.toString() === req.user.id` is the core of our multi-user security. It ensures that only the person who reported an item can mark it as closed.
- **Regex Search Performance:** For the general search, we use `$regex` with the `i` (case-insensitive) flag. This allows a user to search for "Bag" and find "black school bag". To keep this fast, we query both `title` and `description` using the `$or` operator.
- **The Enrichment Pattern:** This is a crucial design choice. The Python AI service doesn't know about our database; it only knows about text. Node sends the text, gets the "ranking", and then "enriches" that ranking with the actual database IDs and images. This keeps the AI service focused solely on math, while Node handles the data.
```

### 3.9 Complete Route Map

| Method | Route | Auth | Middleware | Controller |
|--------|-------|------|-----------|------------|
| GET | `/health` | No | — | 200 OK |
| POST | `/api/auth/register` | No | — | Register |
| POST | `/api/auth/login` | No | — | login |
| POST | `/api/auth/logout` | Yes | protectRoute | logOut |
| GET | `/api/auth/me` | Yes | protectRoute | checkAuth |
| POST | `/api/lost/create` | Yes | protectRoute → upload.single("image") | createItem |
| GET | `/api/lost` | No | — | getItem (?q=, ?category=) |
| GET | `/api/lost/my-items` | Yes | protectRoute | getMyItems |
| GET | `/api/lost/match/:id` | Yes | protectRoute | matchItem |
| DELETE | `/api/lost/delete/:id` | Yes | protectRoute | deleteItem |
| PATCH | `/api/lost/status/:id` | Yes | protectRoute | updateStatus |
| GET | `/api/lost/:id` | No | — | getItembyId |
| POST | `/api/found/create` | Yes | protectRoute → upload.single("image") | createItem |
| GET | `/api/found` | No | — | getItem |
| GET | `/api/found/my-items` | Yes | protectRoute | getMyItems |
| DELETE | `/api/found/delete/:id` | Yes | protectRoute | deleteItem |
| PATCH | `/api/found/status/:id` | Yes | protectRoute | updateStatus |
| GET | `/api/found/:id` | No | — | getItembyId |

---

## 4. Python AI Service

### 4.1 Complete Source — `app.py`

```python
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
import os

app = Flask(__name__)
model = SentenceTransformer('all-MiniLM-L6-v2')  # Loaded ONCE at startup (~2-3 sec, ~200MB RAM)

@app.route('/match', methods=['POST'])
def match():
    data = request.json
    lost_description = data.get('lost')         # Single string: "black leather wallet"
    found_descriptions = data.get('found')       # List: ["brown bag", "dark bifold wallet", ...]

    if not lost_description or not found_descriptions:
        return jsonify({'error': 'Missing data'}), 400

    # Step 1: Encode text → 384-dimensional vectors
    lost_embedding = model.encode(lost_description, convert_to_tensor=True)
    found_embeddings = model.encode(found_descriptions, convert_to_tensor=True)

    # Step 2: Cosine similarity — how similar is each found item to the lost item?
    scores = util.cos_sim(lost_embedding, found_embeddings)[0]
    # [0] because cos_sim returns a matrix; we have 1 lost item → take first row

    # Step 3: Build results
    results = []
    for i, score in enumerate(scores):
        results.append({
            'index': i,
            'score': float(score),              # Convert tensor → Python float
            'description': found_descriptions[i]
        })

    # Step 4: Sort by score descending — best match first
    results = sorted(results, key=lambda x: x['score'], reverse=True)
    return jsonify({'matches': results})
```

#### 💡 Deep Dive: The AI Matchmaker
- **Microservice Isolation:** Why separate this? Because the `sentence-transformers` library and its dependencies (like PyTorch) are heavy. By isolating it in its own container, we ensure that if the AI logic crashes or runs out of RAM, the rest of the website (auth, listing items, etc.) stays perfectly functional.
- **The Embedding Process:** Inside `model.encode()`, the text "brown leather wallet" is mathematically transformed into a list of 384 numbers. These numbers represent the "semantic space" where "wallet" and "purse" are positioned close to each other, even though they share zero letters.
- **Cosine Similarity (The Matcher):** `util.cos_sim` is a matrix operation. It's essentially calculating the "angle" between our lost item vector and every single found item vector. A narrower angle means a higher score. This is much more powerful than keyword matching because it understands context.

@app.route("/health")
def health():
    return "OK", 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

### 4.2 Model: `all-MiniLM-L6-v2`

| Property | Value |
|----------|-------|
| Size | ~80MB |
| Output dimensions | 384 numbers per sentence |
| Speed | ~1000 sentences/sec on CPU |
| Training data | 1B+ sentence pairs |
| Best for | Semantic similarity, paraphrase detection |

**What is an embedding?** A list of 384 numbers that captures the *meaning* of a sentence. Similar meanings → vectors point in similar directions.

### 4.3 Cosine Similarity Explained

Formula: `cos_sim(A, B) = (A · B) / (|A| × |B|)`

Measures the angle between two vectors:
- **1.0** → identical meaning (same direction)
- **0.0** → completely unrelated (perpendicular)
- **-1.0** → opposite meaning (rare)

**Score interpretation:**
| Range | Label | Example |
|-------|-------|---------|
| 0.7 - 1.0 | Strong Match | "black leather wallet" ↔ "dark bifold wallet" |
| 0.5 - 0.7 | Possible Match | "black leather wallet" ↔ "black purse" |
| 0.0 - 0.5 | Weak Match | "black leather wallet" ↔ "set of car keys" |

---

## 5. React Frontend

### 5.1 App Structure

```
App.jsx
├── AuthProvider (wraps everything — global user state)
├── BrowserRouter
│   ├── Navbar (conditional links based on isLoggedIn)
│   ├── AnimatedRoutes (keyed by location.pathname)
│   │   ├── /             → Home.jsx
│   │   ├── /login        → Login.jsx
│   │   ├── /register     → Register.jsx
│   │   ├── /report-lost  → ReportLost.jsx
│   │   ├── /report-found → ReportFound.jsx
│   │   ├── /item/:id     → ItemDetail.jsx
│   │   ├── /my-items     → MyItems.jsx
│   │   └── /about        → About.jsx
│   └── Footer
```

### 5.2 API Service — `services/api.js`

```javascript
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;   // Baked at build time by Vite
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true    // CRITICAL — sends cookies with every request
});
export default api;
```

#### 💡 Deep Dive: The Gateway
- **Centralized Config:** By creating an `api` instance with `axios.create()`, we ensure that every single request from our React app uses the correct `baseURL`. This makes the code cleaner and allows us to easily switch between a local development server and a production server.
- **The Cookie Mechanism:** `withCredentials: true` is our most important setting. Without it, the browser would simply "forget" to include our JWT cookie in requests to the server, and the entire authentication system would break.
```

**`import.meta.env.VITE_API_URL`:** Vite replaces this at build time with the actual value. In Docker, passed via `ARG VITE_API_URL` in the Dockerfile.

### 5.3 AuthContext — `context/AuthContext.jsx`

```javascript
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);    // Prevents flash of wrong UI

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get("/auth/me");  // Cookie sent automatically
                if (response.data.user) {
                    setUser({
                        id: response.data.user._id,
                        username: response.data.user.username,
                        email: response.data.user.email
                    });
                    setIsLoggedIn(true);
                }
            } catch (error) {
                console.error("Auth check failed", error);  // Cookie invalid/expired
            } finally {
                setLoading(false);   // UI can now render
            }
        };
        checkAuth();
    }, []);    // Empty deps = runs once on mount

    const login = (userdata) => { setUser(userdata); setIsLoggedIn(true); };
    const logOut = () => { setUser(null); setIsLoggedIn(false); };

    return (
        <authContext.Provider value={{ user, isLoggedIn, login, logOut, loading }}>
            {children}
        </authContext.Provider>
    );
};
```

#### 💡 Deep Dive: Global state management
- **A Single Source of Truth:** `AuthContext` ensures that every part of your app (the Navbar, the Report page, etc.) knows exactly who the logged-in user is at all times. This prevents "Stale State" where the Navbar might show "Login" while the user is actually authenticated.
- **Persistence:** The `useEffect` with `checkAuth()` is the "Security Handshake". Every time you refresh the page, the app immediately asks the server, "Is this person still who they say they are?". If the cookie is valid, the user stays logged in seamlessly.
- **Preventing UI Flickering:** By using a `loading` state, we ensure the user never sees a "Login" button for a split second before the app realizes they are already logged in. It provides a premium, smooth experience.
```

**Why `loading` state?** Without it, on page refresh the app briefly shows logged-out UI before the auth check completes. `AnimatedRoutes` shows "Loading..." until `loading === false`.

### 5.4 Home.jsx — Search with Debouncing

```javascript
useEffect(() => {
    const fetchItems = async () => {
        const params = {};
        if (searchQuery) params.q = searchQuery;
        if (category) params.category = category;
        const lost = await api.get('/lost/', { params });    // ?q=...&category=...
        const found = await api.get('/found/', { params });
        setLostItems(lost.data.items);
        setFoundItems(found.data.items);
    };

    const debounceTimer = setTimeout(() => { fetchItems(); }, 300);
    return () => clearTimeout(debounceTimer);   // Cleanup on re-render
}, [searchQuery, category]);
```

**Debouncing:** Waits 300ms after the user stops typing before fetching. Without this, every keystroke would trigger an API call. The cleanup function cancels the previous timer if the user keeps typing.

#### 💡 Deep Dive: UX Performance
- **Server Mercy:** Why 300ms? If a user types "Black Nike Bag", that's 14 keystrokes. Without debouncing, that's 14 database queries. With debouncing, it's just **one**. This keeps the server costs low and the app feel responsive.
- **State Sync:** By depending on `[searchQuery, category]`, the `useEffect` automatically re-runs whenever the user types or filters. This "Reactive" approach ensures the UI is always in sync with the search filters.

### 5.5 ItemDetail.jsx — AI Match Display

**Fetch logic:** Tries `/lost/:id` first. If 404, tries `/found/:id`. If it's a lost item, also fetches `/lost/match/:id` for AI matches.

**Match quality tiers:**
```javascript
const getMatchQuality = (score) => {
    if (score > 0.7) return 'match-high';    // Green
    if (score > 0.5) return 'match-medium';  // Yellow
    return 'match-low';                       // Red
};
```

**Circular progress bar (SVG):**
```javascript
const circumference = 251.2;   // 2πr = 2π(40)
const offset = circumference - (percentage / 100) * circumference;
// Applied as stroke-dashoffset on an SVG circle
```

**Owner check:** `user.id === item.reportedBy` → show Delete button.

#### 💡 Deep Dive: Visualizing Data
- **The SVG Math:** The circular progress bar is not an image; it's a dynamic SVG path. By calculating the `stroke-dashoffset`, we can smoothly animate the similarity score from zero to the final percentage (e.g., 85%) during page load.
- **Quality Indicator Logic:** We use color tiers (Green, Yellow, Red) because raw numbers (like 0.65) are hard for human users to interpret quickly. This categorization makes the AI results immediately actionable.
- **Conditional Actions:** Notice the owner check (`user.id === item.reportedBy`). This ensures that only the authorized reporter can delete an item, preventing malicious users from deleting other people's reports.

### 5.6 Register.jsx — Client-Side Validation

Full validation before API call:
- Username: 3-20 chars, alphanumeric + hyphens/underscores only
- Email: regex validation, max 100 chars
- Password: min 6 chars, requires lowercase + uppercase + number + special char
- Confirm password: must match
- Real-time password requirement checklist shown to user
- Errors cleared per-field as user types (`handleInputChange`)

### 5.7 ReportLost.jsx — Image Upload Flow

```javascript
// 1. User picks file → preview shown via URL.createObjectURL
const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));  // Local preview URL
};

// 2. On submit → create FormData (multipart)
const formData = new FormData();
formData.append('title', title);
formData.append('description', description);
formData.append('image', image);   // File object
await api.post('/lost/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
```

### 5.8 3D Background — SplineBackground.jsx

Uses **Three.js** via `@react-three/fiber` and `@react-three/drei`:
- Creates 3 overlapping glass ribbon meshes (`PlaneGeometry` with 128×64 segments)
- `useFrame` hook morphs vertices every frame using sine/cosine waves + twist
- Mouse cursor creates ripple distortion on the ribbons
- Theme-specific colors for each page (orange for lost, green for found, purple for auth)
- `meshPhysicalMaterial` with `transmission: 0.8` creates frosted glass effect
- `AnimatedBackground.jsx` is a wrapper that renders `SplineBackground` behind any page content

---

## 6. Docker & Infrastructure

### 6.1 Three Dockerfiles

**Node Backend (`backend-node/Dockerfile`):**
```dockerfile
FROM node:20-alpine              # 180MB vs 1GB full image
WORKDIR /app
COPY package*.json ./            # Copy dependency list FIRST
RUN npm ci --only=production     # Install deps (cached if package.json unchanged)
COPY . .                         # Source code (changes often → BOTTOM)
EXPOSE 3000
CMD ["node", "server.js"]        # Array syntax = proper signal handling (Ctrl+C)
```

**Python AI (`backend-python/Dockerfile`):**
```dockerfile
FROM python:3.12-slim                    # ~130MB vs 1GB full
WORKDIR /app
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

Key decisions:
- `gcc` needed to compile C extensions for sentence-transformers
- CPU-only PyTorch: 188MB vs 915MB + 1.5GB CUDA
- Model baked into image: container starts instantly (no 30-sec download)

**Frontend (`frontend/Dockerfile`) — Multi-stage:**
```dockerfile
# Stage 1: Build (heavy — ~200MB)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL                 # Build-time variable
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build                # Output: dist/ folder

# Stage 2: Serve (light — ~25MB)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Stage 1 is completely discarded. Final image: ~30MB.

### 6.2 Docker Compose

**`docker-compose.yml`** defines 3 services on `traceit-net` network:
- `depends_on` chain: python-ai → node-backend → frontend
- `VITE_API_URL` passed as build arg to frontend
- `env_file: ./backend-node/.env` loads secrets into node-backend

**`docker-compose.override.yml`** (auto-loaded in dev):
- Volume mounts for hot reload: `./backend-node:/app`
- `/app/node_modules` anonymous volume prevents host overwriting container's modules
- Replaces CMD with `nodemon` (Node) and `flask --reload` (Python)

### 6.3 Layer Caching

```
Line 1: FROM node:20-alpine          → cached always
Line 2: COPY package*.json ./        → cached if package.json unchanged
Line 3: RUN npm ci                   → cached if package.json unchanged ← KEY
Line 4: COPY . .                     → re-runs every time code changes
```

**Rule:** Things that change rarely → TOP. Source code → BOTTOM. Rebuild takes 2 seconds instead of 45.

---

## 7. Security & Authentication

### JWT Cookie Flow

```
REGISTER/LOGIN:
  Client → POST { username, password }
  Server → bcrypt.compare → jwt.sign({ id }, SECRET, { expiresIn: "1h" })
  Server → res.cookie("token", jwt, { httpOnly, sameSite: "none", secure: true })
  Client ← 200 { user data }

EVERY REQUEST AFTER:
  Browser automatically attaches cookie (because withCredentials: true)
  Server → protectRoute → jwt.verify → req.user = { id }

LOGOUT:
  Server → res.clearCookie("token", { same options })
```

### Why HTTP-only Cookies > localStorage

| | HTTP-only Cookie | localStorage |
|---|---|---|
| JS access | ❌ `document.cookie` can't see it | ✅ `localStorage.getItem()` |
| XSS attack | Token is safe — JS can't steal it | Token stolen instantly |
| Sent automatically | ✅ Browser handles it | ❌ Must manually add to headers |
| Cross-origin | Needs `sameSite=none` + `secure` | Needs `Authorization` header |

### Password Security

```javascript
// Register: bcrypt.hash(password, 10)
// - 10 = salt rounds = 2^10 iterations of hashing
// - Same password + different salt = different hash every time
// - Makes brute-force computationally expensive

// Login: bcrypt.compare(plaintext, storedHash)
// - Returns true/false without needing to know the salt
```

### Owner-Only Operations

```javascript
const isOwner = item.reportedBy.toString() === req.user.id;
// ObjectId needs .toString() for comparison with string from JWT
if (!isOwner) return res.status(403).json({ message: "Forbidden" });
```

---

## 8. AI Matching Pipeline

### End-to-End Flow

```
1. User clicks "View Matches" on a lost item → React calls GET /api/lost/match/:id
2. protectRoute verifies JWT
3. Controller: lostItem = findById(id), foundItems = find() (all)
4. Controller: axios.post(PYTHON_URL + "/match", {
     lost: lostItem.description,
     found: foundItems.map(f => f.description)
   })
5. Python: model.encode(lost) → [0.23, -0.41, 0.87, ...] (384 numbers)
6. Python: model.encode(found) → matrix of vectors
7. Python: cos_sim(lost_vector, found_matrix)[0] → [0.21, 0.85, 0.18, ...]
8. Python: sort descending by score → return { matches: [...] }
9. Node: ENRICHES each match with _id, title, location, category, image from DB
10. React: renders match cards with circular SVG progress bars + quality labels
```

### What is `[0]` in `cos_sim(...)[0]`?

`cos_sim` returns a 2D matrix. We have 1 lost item vs N found items → result is a 1×N matrix. `[0]` takes the first (and only) row → gives us N scores.

---

## 9. Image Upload Pipeline

```
User selects file in browser
    ↓ onChange → URL.createObjectURL(file) for preview
Submit form
    ↓ new FormData() → append all fields + file → api.post (multipart/form-data)
Express receives request
    ↓ protectRoute (JWT check)
    ↓ upload.single("image") — Multer processes file → req.file.buffer (in RAM)
Controller
    ↓ uploadToCloudinary(req.file.buffer)
    ↓ cloudinary.uploader.upload_stream({ folder: "TraceIt" }).end(buffer)
    ↓ Cloudinary processes, stores, returns secure_url (HTTPS)
    ↓ lostItemModel.create({ ..., image: cloudinaryUrl, reportedBy: req.user.id })
Response → { item: { ... } }
```

---

## 10. Interview Questions & Answers

### Architecture & Design

**Q: Why did you use a microservice architecture instead of a monolith?**
> The Python AI service has a completely different runtime (Python + PyTorch) and resource profile (~200MB RAM for the model). Keeping it separate means: (1) Node stays lightweight and fast for API calls. (2) Each service can be scaled independently. (3) If we swap the AI model or add GPU support, only the Python service changes. (4) Teams can work on each service independently.

**Q: Why not put the AI matching directly in Node.js?**
> sentence-transformers only runs in Python. There's no production-ready Node.js equivalent for this model. Also, loading a ~200MB ML model into the same process as the API server would slow down every request, not just match requests.

**Q: How do the services communicate inside Docker?**
> All three services share a private Docker bridge network called `traceit-net`. Docker DNS lets them use service names as hostnames — so Node calls `http://python-ai:5000/match`. The browser never talks to Python directly.

**Q: Why MongoDB and not PostgreSQL?**
> The data is document-oriented — each item is a self-contained document with title, description, location, etc. No complex joins needed. MongoDB's flexible schema is perfect for this. Also, MongoDB Atlas provides a free cloud tier with zero infrastructure management.

### Authentication & Security

**Q: Explain your authentication flow.**
> On login, the server verifies credentials with bcrypt, signs a JWT containing the user's ID with a 1-hour expiry, and sets it as an HTTP-only cookie. HTTP-only means JavaScript cannot access it — preventing XSS token theft. On every subsequent request, the browser automatically sends the cookie. The `protectRoute` middleware reads the cookie, verifies the JWT, and attaches `req.user` to the request. On logout, the cookie is cleared.

**Q: Why HTTP-only cookies instead of localStorage?**
> localStorage is accessible via `document.cookie` and JavaScript. Any XSS vulnerability could steal the token. HTTP-only cookies are invisible to client-side code — the browser manages them automatically. This is the industry-standard approach for storing auth tokens securely.

**Q: What is `sameSite: "none"` and why do you need it?**
> Because the frontend and backend are on different origins (different ports locally, different domains in production). `sameSite: "none"` tells the browser to send cookies even on cross-origin requests. It requires `secure: true` (HTTPS only) as a security requirement.

**Q: What happens if the JWT expires?**
> The `protectRoute` middleware calls `jwt.verify()` which throws an error for expired tokens. The middleware catches it and returns 401 Unauthorized. On the frontend, `AuthContext.checkAuth()` fails → `user` stays null → user sees logged-out state.

### AI & Matching

**Q: How does the AI matching work?**
> The Python service uses a pre-trained sentence transformer model (all-MiniLM-L6-v2) to convert text descriptions into 384-dimensional vector embeddings. These vectors capture semantic meaning — similar descriptions produce vectors pointing in similar directions. Cosine similarity measures the angle between vectors: 1.0 = identical meaning, 0.0 = unrelated. Results are sorted by score descending, so the best semantic matches appear first.

**Q: What is cosine similarity?**
> It measures the cosine of the angle between two vectors. Unlike Euclidean distance, it's invariant to magnitude — only direction matters. This is ideal for text embeddings because a longer description shouldn't automatically score higher. The formula is `(A · B) / (|A| × |B|)`, returning a value between -1 and 1.

**Q: Why `all-MiniLM-L6-v2` specifically?**
> It's the best tradeoff for this use case. At 80MB it's small enough to bake into a Docker image. It processes ~1000 sentences/second on CPU. It was trained on 1 billion+ sentence pairs. Larger models like `all-mpnet-base-v2` (420MB) are slightly more accurate but 5x slower — overkill for matching item descriptions.

**Q: What do the match scores mean in practice?**
> Above 0.7 is a strong match — descriptions semantically describe the same item. 0.5-0.7 is a possible match worth reviewing. Below 0.5 is usually a different item. For example, "black leather wallet" vs "dark bifold wallet" scores ~0.85, while "black leather wallet" vs "car keys" scores ~0.15.

### Image Upload

**Q: How does image upload work in your app?**
> The frontend sends the image as multipart/form-data using FormData. Multer middleware with memory storage processes the file into a buffer in RAM (never written to disk). The controller streams that buffer to Cloudinary using their `upload_stream` API, which returns a permanent HTTPS URL. We store only the URL in MongoDB.

**Q: Why Cloudinary instead of storing images on your server?**
> Cloudinary provides CDN-backed delivery (fast globally), automatic image optimization, no disk storage management, and HTTPS URLs. Storing on the Express server would require disk management, serve middleware, and wouldn't scale.

### Docker

**Q: Explain multi-stage builds.**
> The frontend Dockerfile has two `FROM` statements. Stage 1 uses Node (~200MB) to compile React into static files. Stage 2 starts fresh with Nginx (~25MB) and copies only the built files using `COPY --from=builder`. The entire Node environment is discarded. Final image: ~30MB.

**Q: Why is the AI model baked into the Docker image?**
> Without it, every container start would need to download the 80MB model from Hugging Face — a 30-second delay. Baking it in via `RUN python -c "SentenceTransformer('all-MiniLM-L6-v2')"` means the model is already on disk when the container starts. Startup takes under 3 seconds.

**Q: What is Docker layer caching?**
> Every Dockerfile instruction creates a layer. If a line hasn't changed, Docker reuses the cached result. That's why we `COPY package.json` before `COPY . .` — npm install only re-runs if dependencies change. Source code changes don't invalidate the dependency layer.

### Frontend

**Q: How does the AuthContext work?**
> It's a React Context that provides `user`, `isLoggedIn`, `login`, `logOut`, and `loading` to all components. On mount, it calls `GET /auth/me` to check if the JWT cookie is still valid. The `loading` state prevents a flash of logged-out UI during this check.

**Q: What is debouncing and where do you use it?**
> In the Home page search, I use a 300ms debounce via `setTimeout` in a `useEffect`. Each keystroke resets the timer. Only after the user stops typing for 300ms does the API call fire. This prevents flooding the server with requests on every keystroke.

**Q: How does the item detail page determine if an item is lost or found?**
> It tries fetching from `/lost/:id` first. If that returns a 404, it tries `/found/:id`. The type is stored in component state: `setItem({ ...response.data.item, type: isLost ? 'Lost' : 'Found' })`. If it's a lost item, it also automatically fetches AI matches.

### General / Behavioral

**Q: What was the most challenging part of this project?**
> Getting the three services to communicate correctly inside Docker. Service-to-service calls need Docker DNS names (`python-ai`) not `localhost`. Browser-to-service calls need `localhost` with port mapping. Understanding this networking model took significant debugging.

**Q: How would you scale this application?**
> (1) Add Redis for caching match results — repeated matches for the same item don't need re-computation. (2) Run multiple Node containers behind a load balancer. (3) If matching becomes slow with many items, pre-compute embeddings on insert and store them, rather than encoding on every match request. (4) Move Python to GPU instances if match volume demands it.

**Q: What would you improve if you had more time?**
> (1) Real-time notifications via WebSockets when a new match is found. (2) Image-based matching alongside text — compare photos using CLIP model. (3) Location-based filtering to narrow matches to nearby areas. (4) Rate limiting on auth endpoints to prevent brute-force attacks. (5) Email verification on registration.
