import express from "express";
import cors from "cors";
import apiRoute from "./routes/index.route.js";
import { authorize, protect } from "./middleware/auth.midleware.js";

const app = express();

// CORS configuration - allow all localhost ports in development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    // Allowed origins list
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://citizen-assist-teal.vercel.app",
      ...(process.env.CLIENT_ORIGIN ?? "")
        .split(",")
        .map((value) => value.trim()),
    ].filter(Boolean);

    // Allow any localhost port in development
    if (
      process.env.NODE_ENV === "development" &&
      (origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:"))
    ) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    const isCitizenAssistPreview =
      origin.includes("citizen-assist") && origin.endsWith(".vercel.app");

    if (allowedOrigins.includes(origin) || isCitizenAssistPreview) {
      return callback(null, true);
    }

    // Log rejected origins for debugging
    console.warn(`⚠️ CORS: Origin not allowed: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

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

  res.status(error.status ?? 500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong on our side."
        : (error.message ?? "Unknown error"),
  });
});

export default app;
