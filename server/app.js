import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoute from "./routes/index.route.js";
import { authorize, protect } from "./middleware/auth.midleware.js";
import { getRequestDocument } from "./controllers/upload.controller.js";

const app = express();

// CORS configuration - production-ready with environment-based origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);

    // Parse allowed origins from CLIENT_URL environment variable
    const allowedOrigins = (process.env.CLIENT_URL || "")
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

    // Development: Allow all localhost ports
    if (
      process.env.NODE_ENV !== "production" &&
      (origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:"))
    ) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log rejected origins for debugging (not in production to avoid log spam)
    if (process.env.NODE_ENV !== "production") {
      console.warn(`⚠️ CORS: Origin not allowed: ${origin}`);
    }
    
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(cookieParser()); // Parse cookies for authentication
app.use(express.json());
app.get("/uploads/:filename", protect, getRequestDocument);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Citizen Assist API",
    time: new Date().toISOString(),
  });
});

app.get("/api/test/admin-only", protect, authorize("citizen"), (req, res) => {
  return res.json({
    status: "success",
    message: "citizen access granted",
    user: {
      id: req.user._id,
      role: req.user.role,
    },
  });
});

app.use(apiRoute);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  const uploadError = error.code === "LIMIT_FILE_SIZE" || error.message?.startsWith("Only PDF, JPG and PNG");
  res.status(uploadError ? 400 : (error.status ?? 500)).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong on our side."
      : (error.message ?? "Unknown error"),
  });
});

export default app;
