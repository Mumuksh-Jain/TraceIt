const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth.route");
const lostitemRoutes = require("./routes/lostitem.route");
const foundItemRoutes = require("./routes/foundItem.route");
const notificationRoutes = require("./routes/notification.route");

const app = express();

// Trust proxy for secure headers and rate limiting behind reverse proxies (Render, Vercel, Cloudflare)
app.set("trust proxy", 1);

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Handled per-deployment or in frontend
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// Enforce HTTPS in production environments
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// General API rate limiter (protect against DDoS and scraping)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use("/api/", apiLimiter);

// Strict rate limiter for Authentication (prevent brute-force and credential stuffing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts, please try again in 15 minutes." }
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Spam protection rate limiter for creating lost/found items
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Item creation limit reached for this hour. Please try again later." }
});
app.use("/api/lost/create", reportLimiter);
app.use("/api/found/create", reportLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://trace-it-nu.vercel.app"
      ];

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Anti-spam honeypot interceptor for form submissions
app.use((req, res, next) => {
  if (req.method === "POST" && req.body && req.body._gotcha) {
    // Bot filled honeypot - silently drop or return fake success
    return res.status(200).json({ message: "Request received" });
  }
  next();
});

// API Routes
app.use("/api/lost", lostitemRoutes);
app.use("/api/found", foundItemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);

module.exports = app;