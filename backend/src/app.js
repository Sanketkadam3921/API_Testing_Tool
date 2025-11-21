import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import rateLimit from "express-rate-limit";
import statusMonitor from "express-status-monitor";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { cacheMiddleware } from "./middleware/cacheMiddleware.js";

// Routes
import authRoutes from "./modules/auth/auth.routes.js";
import testRoutes from "./modules/tests/tests.routes.js";
import monitorRoutes from "./modules/monitors/monitors.routes.js";
import metricsRoutes from "./modules/metrics/metrics.routes.js";
import alertsRoutes from "./modules/alerts/alerts.routes.js";
import collectionsRoutes from "./modules/collections/collections.routes.js";
import historyRoutes from "./modules/history/history.routes.js";
import environmentsRoutes from "./modules/environments/environments.routes.js";
import batchRoutes from "./modules/batch/batch.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import apiTestRoutes from "./routes/apiTest.routes.js";
import testApiRoutes from "./routes/testApi.routes.js";

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://api-testing-tool-bice.vercel.app", // ADD THIS
      ];

      if (
        process.env.NODE_ENV === "development" ||
        allowedOrigins.indexOf(origin) !== -1
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "Origin",
      "X-Auth-Token",
    ],
    exposedHeaders: ["Content-Length", "Content-Type"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Explicit OPTIONS handler
app.options("*", cors());

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// System status dashboard
app.use(
  statusMonitor({
    title: "ApexAPI Monitor",
    path: "/status",
    spans: [
      { interval: 1, retention: 60 },
      { interval: 5, retention: 60 },
      { interval: 15, retention: 60 },
    ],
    chartVisibility: {
      cpu: true,
      mem: true,
      load: true,
      heap: true,
      eventLoop: true,
      responseTime: true,
      rps: true,
      statusCodes: true,
    },
    healthChecks: [
      {
        protocol: "http",
        host: "localhost",
        path: "/health",
        port: process.env.PORT || 3001,
      },
    ],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cache middleware
app.use(cacheMiddleware());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ApexAPI is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/monitors", monitorRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/collections", collectionsRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/environments", environmentsRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api", apiTestRoutes);
app.use("/api", testApiRoutes);

/*  
=====================================================
 TEMPORARY ROUTE: /setup  
 RUNS fix-database.js ONCE TO CREATE TABLES ON RENDER 
 REMOVE AFTER SUCCESS 
=====================================================
*/
// app.get("/setup", async (req, res) => {
//   try {
//     const fixDatabaseModule = await import("../fix-database.js");
//     const fixDatabase = fixDatabaseModule.default || fixDatabaseModule;
//     if (typeof fixDatabase !== 'function') {
//       throw new Error('fixDatabase is not a function. Received: ' + typeof fixDatabase);
//     }
//     // Don't close the pool when called from route handler
//     await fixDatabase({ closePool: false });

//     res.json({
//       success: true,
//       message: "Database initialized",
//     });
//   } catch (err) {
//     console.error("Setup error:", err);
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// });

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

export default app;
